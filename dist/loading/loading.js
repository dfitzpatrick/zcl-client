"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ipc = require('electron').ipcRenderer;
var remote = require('electron').remote;
var client = remote.getGlobal('client');
console.log('here');
var username = require('username');
var message = document.getElementById('message');
var gamePath = client.settings.get('gamePath');
ipc.on('yourmom', function (event, messages) {
    console.log(event);
    console.log(messages);
    message.innerHTML = messages.status;
});
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
//# sourceMappingURL=loading.js.map