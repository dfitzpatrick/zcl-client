import pathlib = require('path')
const ipc = require('electron').ipcRenderer
const remote = require('electron').remote


const message = document.getElementById('message')

ipc.on('loading-update', (event: any, messages: any) => {
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







