import { app, BrowserWindow, ipcMain, webContents } from 'electron'
import Settings from './settings'
const fs = require('fs').promises

import * as path from 'path'
import Client from './objects'
import Axios from 'axios';
import { createDetectWindow } from './detect'
import { SSL_OP_EPHEMERAL_RSA } from 'constants'
const fetch = require('node-fetch')
const moment = require('moment')
const {remote, dialog} = require('electron')

let scanningWindow

(<any>global).client = new Client()

let client: Client
let confirmWin: BrowserWindow
let mainWin: BrowserWindow
let loadingWin: BrowserWindow
let authWin: BrowserWindow

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
  client.watch()
  client.api.updateHeaders()
  client.linkSmurfs()
  client.syncReplays()
  
  const mainWindow = new BrowserWindow({
    height: 400,
    width: 500,
    webPreferences: {nodeIntegration: true}
  });
  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  mainWindow.on('closed', ():null => loadingWin = null)
  return mainWindow
}

 function  createScanningWindow() {
  let loadingWin = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  loadingWin.loadFile(path.join(__dirname, '../src/loading/loading.html'))

  loadingWin.on('closed', ():null => loadingWin = null)

  return loadingWin
}
function createConfirmPathDialog() {
  let confirmWin = new BrowserWindow({
    width: 500,
    height: 400,
    frame: true,
    transparent: true,
    resizable: true,
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
      const access_token = url.match(/\&(?:access_token)\=([\S\s]*?)\&/)[1]
      console.log('discord access token: ' + access_token)
      try {
        const exchange = await client.api.exchangeToken(access_token)
        client.settings.set('token', exchange.token)
        client.settings.set('user', exchange.user)
        client.settings.save()
        await client.api.updateHeaders()
        createMainWindow()
        return destroyAuthWin()

      } catch (err) {
        dialog.showErrorBox("Could not successfully log in", "We could not log you in. You must log into our website before using this client. If you have, your credentials might have been suspended. Contact an admin on Discord")
        app.quit()
      }
      
  })

  authWin.on('closed', () => {
      authWin = null;
    });
  return authWin
}

async function updateLoadStatus(win: BrowserWindow, message: string) {
  win.webContents.send('yourmom', {'status': message})
  await sleep(500)
}
async function main() {
  const bankPath = path.normalize('c:/users/dfitz/onedrive/desktop/ZoneControlCE.SC2Bank')
  client = new Client()
  //client.settings.set('token', null)
  //client.settings.set('gamePath', undefined)
  //let fo = await fs.readFile(bankPath)  
  //await client.api.uploadBank(fo)
  //console.log('sent bank')

  const loadingWin = createScanningWindow()
  confirmWin = createConfirmPathDialog()

  client.settings.set('gamePath', undefined)
  client.settings.set('token', null)
  client.settings.save()

  confirmWin.loadFile(path.join(__dirname, '../src/pages/changeDirectory/changeDirectory.html'))
  loadingWin.webContents.on('did-finish-load', async () => {
    loadingWin.show()
    let gamePath = client.settings.get('gamePath')
    client.path = gamePath
    try {
      await client.load()
    } catch (err) {
      await updateLoadStatus(loadingWin, "Scanning for SC2")
      gamePath = await client.detectPath()
      console.log(gamePath)
      const status = gamePath === undefined ?  
        "We could not find your game directory. Please manually choose it." 
        : "We automatically detected your game directory below. Please confirm."
      
      confirmWin.webContents.send('updateStatus', {
        status: status,
        gamePath: gamePath,
      })
      confirmWin.show()
      loadingWin.hide()

    }
  })

};

async function authenticate() {
  return new Promise(async (resolve, reject) => {
    try {
      const authenticated = await client.authenticate()
      if (authenticated) {
        mainWin = createMainWindow()
        resolve()
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
  client.path = gamePath
  updateLoadStatus(loadingWin, "Mapping Accounts")
  confirmWin.hide()
  loadingWin.show()
  try {
    await client.load()
  } catch (err) {
    confirmWin.webContents.send('updateStatus', {
      status: err,
      gamePath: gamePath
    })
    confirmWin.show()
  }
})


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', main);

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
