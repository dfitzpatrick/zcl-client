"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ipc = require('electron').ipcRenderer;
var remote = require('electron').remote;
var message = document.getElementById('message');
var btnBrowse = document.getElementById('btnBrowse');
var btnContinue = document.getElementById('btnContinue');
var gamePath = document.getElementById('gamePath');
ipc.on('updateStatus', function (event, messages) {
    message.innerHTML = messages.status;
    gamePath.innerHTML = messages.gamePath || "No Path Set";
});
ipc.on('clientState', function (event, messages) {
    message.innerHTML = messages;
});
btnBrowse.addEventListener('click', function () {
    ipc.send('browseDirectory');
});
btnContinue.addEventListener('click', function () {
    ipc.send('confirmDirectory', gamePath.innerText);
});
//# sourceMappingURL=changeDirectory.js.map