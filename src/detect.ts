import { BrowserWindow } from 'electron'
import Client from './objects';
import { createMainWindow } from './index'
const path = require('path')

let win:BrowserWindow = null
function destroyWin() {
    if (!win) return
    win.close();
}
    
export function createDetectWindow(c: Client) {
    destroyWin()
    console.log('in create window')
    win = new BrowserWindow({
        width: 400,
        height: 300,
        show: false,
    })
    win.loadFile(path.join(__dirname, '../src/detectPath.html'))

    
    win.on('closed', () => {
        win = null;
    })
    win.on('ready-to-show', async () => {
        win.show()
        const gamePath = await c.detectPath()
        destroyWin()
    })

}
