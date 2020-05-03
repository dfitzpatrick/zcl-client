const ipc = require('electron').ipcRenderer
const remote = require('electron').remote

const version = document.getElementById('version')
ipc.on('version', (event: any, messages: any) => {
    console.log(event)
    console.log(messages)
    version.innerHTML = messages.version
})