import pathlib = require('path')
import Client from '../objects'
const ipc = require('electron').ipcRenderer
const remote = require('electron').remote

const client: Client = remote.getGlobal('client')
console.log('here')
const username = require('username')

const message = document.getElementById('message')
let gamePath = client.settings.get('gamePath')

ipc.on('yourmom', (event: any, messages: any) => {
    console.log(event)
    console.log(messages)
    message.innerHTML = messages.status
})

/*
message.innerHTML = "Scanning for SC2 Directory..."
client.detectPath().then(sc2Path => {
    client.path = sc2Path
    client.load()
    ipc.send('loading-complete')
    message.innerHTML = "Authenticating..."
})
.catch((err) => {
    // Path not found.
    throw err
    console.log('path not found')
})
*/







