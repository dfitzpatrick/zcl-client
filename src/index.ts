import { app, BrowserWindow, ipcMain } from 'electron'
import Settings from './settings'
const fs = require('fs').promises

import * as path from 'path'
import Client from './objects'
import {createAuthWindow} from './auth'
import Axios from 'axios';
import { createDetectWindow } from './detect'
const fetch = require('node-fetch')
const moment = require('moment')
const remote = require('electron').remote

let scanningWindow

async function directoryExists(directoryPath: string): Promise<boolean> {
  try {
    await fs.access(directoryPath)
    return true
  } catch (err) { return false }
}
//const chokidar = require('chokidar');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
//var dpath = "c:/users/dfitz/onedrive/documents/Starcraft II"
//chokidar.watch(dpath).on('all', (event: any, path: any) => {
//  console.log(event, path);
//});
var dpath = "c:/users/dfitz/onedrive/documents/Starcraft II";
export async function createMainWindow(c: Client) {
  const gamePath = c.settings.get('gamePath')
  try {
    await fs.access(gamePath)
  } catch (err) {
    createDetectWindow(c)
  }
  await c.watch()
  //c.linkSmurfs()
  c.syncReplays()
  

  const mainWindow = new BrowserWindow({
    height: 400,
    width: 500,
    webPreferences: {nodeIntegration: true}
  });
  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
  return
}

 function  createScanningWindow(client: Client) {
  let win = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    resizable: false,
  })
  win.loadFile(path.join(__dirname, '../src/detectPath.html'))

  win.on('closed', ():null => win = null)
  win.webContents.on('did-finish-load', async () => {
    win.show()
    

  })
  return win
}

async function main() {
  let scanningWindow:BrowserWindow
  const c = new Client(dpath);
  let gamePath = c.settings.get('gamePath')
 
  // if doesn't exist, automatically find it (existing methods need reworking)

  // present screen for user to confirm found path, or change it. Or say not found and have them input it.

  // continue to authenticate.


  const authenticated = await c.authenticate()
  if (authenticated === true) {
    createMainWindow(c)
  } else {
    createAuthWindow(c)
  }


};


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
