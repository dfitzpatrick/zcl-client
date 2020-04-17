import { BrowserWindow } from 'electron'
import Client from './objects';
import {createMainWindow} from './index'

let win:BrowserWindow = null
function destroyAuthWin() {
    if (!win) return
    win.close();
    win = null;
}
export function createAuthWindow(c: Client) {
    const url = "https://discordapp.com/api/oauth2/authorize"
    const clientId = "485951338518282251"
    const callbackUrl = 'http://localhost/'
    const target = `${url}?response_type=token&client_id=${clientId}&scope=email&redirect_uri=${callbackUrl}`
    destroyAuthWin()

    win = new BrowserWindow({
        width: 600,
        height: 800,
    });
    win.loadURL(target)
    const {session: {webRequest}} = win.webContents;

    const filter = {
        urls: [
            "http://localhost/"
        ]
    }
    webRequest.onBeforeRequest(filter, async ({url}) => {
        const access_token = url.match(/\&(?:access_token)\=([\S\s]*?)\&/)[1]
        const exchange = await c.api.exchangeToken(access_token)
        c.settings.set('token', exchange.token)
        c.settings.set('user', exchange.user)
        c.settings.save()
        await c.api.updateHeaders()
        createMainWindow(c)
        return destroyAuthWin()
    })

    win.on('closed', () => {
        win = null;
      });
}
module.exports = {
    createAuthWindow,
}