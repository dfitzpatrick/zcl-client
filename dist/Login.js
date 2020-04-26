var ipc = require('electron').ipcRenderer;
var btnLogin = document.getElementById('login');
btnLogin.addEventListener('click', function (event) {
    ipc.send('btnClick');
});
//# sourceMappingURL=Login.js.map