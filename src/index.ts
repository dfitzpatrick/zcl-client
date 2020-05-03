import { app, BrowserWindow, ipcMain, webContents, Menu, Tray} from 'electron'
const fs = require('fs').promises
import * as path from 'path'
import Client from './objects'
const {dialog} = require('electron')
require('update-electron-app')()

let client: Client
let confirmWin: BrowserWindow
let mainWin: BrowserWindow
let loadingWin: BrowserWindow
let authWin: BrowserWindow
let resolveLoad: any
let resolveAuth: any
let tray: Tray
Menu.setApplicationMenu(null)


const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
function destroyAuthWin() {
  if (!authWin) return
  authWin.close();
  authWin = null;
}

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
  export function createMainWindow() {
  
  const version = app.getVersion()
  let mainWindow = new BrowserWindow({
    height: 400,
    width: 500,
    maximizable: false,
    webPreferences: {nodeIntegration: true}
  });
  mainWindow.loadFile(path.join(__dirname, '../src/pages/main/main.html'));

  mainWindow.webContents.on('did-finish-load', async () => {
    console.log('sending version')
    mainWindow.webContents.send('version', {
      version: app.getVersion()
    })

  })
  return mainWindow
}

 function  createScanningWindow() {
  let loadingWin = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  loadingWin.loadFile(path.join(__dirname, '../src/pages/loading/loading.html'))

  loadingWin.on('closed', ():null => loadingWin = null)

  return loadingWin
}
function createConfirmPathDialog() {
  let confirmWin = new BrowserWindow({
    width: 500,
    height: 400,
    frame: true,
    transparent: true,
    resizable: false,
    maximizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  return confirmWin
}
export function createAuthWindow() {
  const url = "https://discordapp.com/api/oauth2/authorize"
  const clientId = "485951338518282251"
  const callbackUrl = 'http://localhost/'
  const target = `${url}?response_type=token&client_id=${clientId}&scope=email&redirect_uri=${callbackUrl}`
  destroyAuthWin()

  authWin = new BrowserWindow({
      width: 600,
      height: 800,
  });
  authWin.loadURL(target)
  const {session: {webRequest}} = authWin.webContents;

  const filter = {
      urls: [
          "http://localhost/"
      ]
  }
  webRequest.onBeforeRequest(filter, async ({url}) => {
    console.log('url is')
    console.log(url)
    var window
    if (url.startsWith('http://localhost/#error')) {
      app.quit()
      return
    }
      const access_token = url.match(/\&(?:access_token)\=([\S\s]*?)\&/)[1]
      console.log('discord access token: ' + access_token)
      try {
        const exchange = await client.api.exchangeToken(access_token)
        //client.settings.set('gamePath', undefined)
        client.settings.set('token', exchange.token)
        client.settings.set('user', exchange.user)
        client.settings.save()
        await client.api.updateHeaders()
    
        window = createMainWindow()
        resolveAuth()
        destroyAuthWin()
        return window
        

      } catch (err) {
        dialog.showErrorBox("Could not successfully log in", "We could not log you in. You must log into our website before using this client. If you have, your credentials might have been suspended. Contact an admin on Discord")
        app.quit()
      }
      
  })

  authWin.on('closed', () => {
    console.log('closing auth win')
      authWin = null;
    });
  return authWin
}

async function updateLoadStatus(win: BrowserWindow, message: string) {
  win.webContents.send('loading-update', {'status': message})
  await sleep(500)
}
async function main() {
  client = new Client()
  //client.settings.set('token', null)
  //client.settings.set('gamePath', "")
  //client.settings.save()


  let gamePath = client.settings.get('gamePath')
  if (gamePath !== "") {
    client.path = gamePath
  }

  try {
    await load()
  } catch (err) {
    console.log('error')
  }
 await authenticate()
  for (const game of client.games) {
    if (!game.tracked) { continue }
    let fo = await fs.readFile(game.bankFile)
        await client.api.uploadBank(fo)
  }
  client.linkSmurfs()
  client.syncReplays()
  console.log('starting watcher in ' + client.path)
  await client.watch()

  console.log('loaded')


};
async function load(scan=true) {
  return new Promise((resolve, reject) => {

    const loadingWin = createScanningWindow()
    confirmWin = createConfirmPathDialog()
    let shouldScan = scan
    let status
    confirmWin.loadFile(path.join(__dirname, '../src/pages/changeDirectory/changeDirectory.html'))
    loadingWin.webContents.on('did-finish-load', async () => {
      loadingWin.show()
      while (true) {
        console.log('in loop to load')
        let gamePath = client.settings.get('gamePath')
        client.path = gamePath
        try {
          console.log('loading')
          const loaded = await client.load()
          if (loaded) {
            loadingWin.close()
            resolve()
            break
          }
        } catch (err) {
          try {
            if (shouldScan) {
              await updateLoadStatus(loadingWin, "Loading Objects")
              gamePath = await client.detectPath()
              shouldScan = false
  
              status = gamePath === undefined ?  
              "We could not find your game directory. Please manually choose it." 
              : "We automatically detected your game directory below. Please confirm."
    
            } else {
              status = "That directory is not valid. Please choose another"
            }
            
            await confirmGamePath(status, gamePath)


          } catch (err) {
            console.log('wtf error')
          }
          
  
        }
      }
    })

  })
 
 }
    
async function confirmGamePath(status: string, gamePath:string ) {
  return new Promise((resolve, reject) => {
    resolveLoad = resolve
    confirmWin.webContents.send('updateStatus', {
      status: status,
      gamePath: gamePath,
    })
    confirmWin.show()
    //loadingWin.hide()

  })
}
async function authenticate() {
  return new Promise(async (resolve, reject) => {
    resolveAuth = resolve
    try {
      const authenticated = await client.authenticate()
      if (authenticated) {
        const version = app.getVersion()
        mainWin = createMainWindow()
        resolve()
        return mainWin
      } else {
        authWin = createAuthWindow()
      }
    } catch (err) {
      authWin = createAuthWindow()
      console.log("Could not authenticate properly")
    }
  })
}

ipcMain.on('browseDirectory', async (event) => {
  const result = await dialog.showOpenDialog(confirmWin, {
    properties: ['openDirectory']
  })
  if (!result.canceled) {
    confirmWin.webContents.send('updateStatus', {
      status: "Please confirm your chosen directory",
      gamePath: result.filePaths[0]
    })
  }
})

ipcMain.on('confirmDirectory', async (event, gamePath) => {
  client.settings.set('gamePath', gamePath)
  client.settings.save()
  //updateLoadStatus(loadingWin, "Mapping Accounts")
  confirmWin.hide()
  resolveLoad(gamePath)
})


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  let tray = new Tray(path.join(__dirname, '../', 'src', 'assets', 'img', 'zcl.ico'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit'},
  ])
  tray.setContextMenu(contextMenu)
  main()

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    main();
  }
 

});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
