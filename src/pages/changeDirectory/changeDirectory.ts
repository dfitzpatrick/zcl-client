import pathlib = require('path')
const ipc = require('electron').ipcRenderer
const remote = require('electron').remote

const message = document.getElementById('message')
const btnBrowse = document.getElementById('btnBrowse')
const btnContinue = document.getElementById('btnContinue')
const gamePath = document.getElementById('gamePath')

ipc.on('updateStatus', (event: any, messages: any) => {
    message.innerHTML = messages.status
    gamePath.innerHTML = messages.gamePath||"No Path Set"
})
ipc.on('clientState', (event: any, messages: any) => {
    message.innerHTML = messages
})

btnBrowse.addEventListener('click', () => {
    ipc.send('browseDirectory')
})
btnContinue.addEventListener('click', () => {
    ipc.send('confirmDirectory', gamePath.innerText)
})


