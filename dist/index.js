"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var fs = require('fs').promises;
var path = require("path");
var objects_1 = require("./objects");
var fetch = require('node-fetch');
var moment = require('moment');
var _a = require('electron'), remote = _a.remote, dialog = _a.dialog;
var scanningWindow;
global.client = new objects_1.default();
var client;
var confirmWin;
var mainWin;
var loadingWin;
var authWin;
var sleep = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
function destroyAuthWin() {
    if (!authWin)
        return;
    authWin.close();
    authWin = null;
}
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    electron_1.app.quit();
}
function createMainWindow() {
    client.watch();
    client.api.updateHeaders();
    client.linkSmurfs();
    client.syncReplays();
    var mainWindow = new electron_1.BrowserWindow({
        height: 400,
        width: 500,
        webPreferences: { nodeIntegration: true }
    });
    mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
    mainWindow.on('closed', function () { return loadingWin = null; });
    return mainWindow;
}
exports.createMainWindow = createMainWindow;
function createScanningWindow() {
    var loadingWin = new electron_1.BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    loadingWin.loadFile(path.join(__dirname, '../src/loading/loading.html'));
    loadingWin.on('closed', function () { return loadingWin = null; });
    return loadingWin;
}
function createConfirmPathDialog() {
    var confirmWin = new electron_1.BrowserWindow({
        width: 500,
        height: 400,
        frame: true,
        transparent: true,
        resizable: true,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    return confirmWin;
}
function createAuthWindow() {
    var _this = this;
    var url = "https://discordapp.com/api/oauth2/authorize";
    var clientId = "485951338518282251";
    var callbackUrl = 'http://localhost/';
    var target = url + "?response_type=token&client_id=" + clientId + "&scope=email&redirect_uri=" + callbackUrl;
    destroyAuthWin();
    authWin = new electron_1.BrowserWindow({
        width: 600,
        height: 800,
    });
    authWin.loadURL(target);
    var webRequest = authWin.webContents.session.webRequest;
    var filter = {
        urls: [
            "http://localhost/"
        ]
    };
    webRequest.onBeforeRequest(filter, function (_a) {
        var url = _a.url;
        return __awaiter(_this, void 0, void 0, function () {
            var access_token, exchange, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        access_token = url.match(/\&(?:access_token)\=([\S\s]*?)\&/)[1];
                        console.log('discord access token: ' + access_token);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, client.api.exchangeToken(access_token)];
                    case 2:
                        exchange = _b.sent();
                        client.settings.set('token', exchange.token);
                        client.settings.set('user', exchange.user);
                        client.settings.save();
                        return [4 /*yield*/, client.api.updateHeaders()];
                    case 3:
                        _b.sent();
                        createMainWindow();
                        return [2 /*return*/, destroyAuthWin()];
                    case 4:
                        err_1 = _b.sent();
                        dialog.showErrorBox("Could not successfully log in", "We could not log you in. You must log into our website before using this client. If you have, your credentials might have been suspended. Contact an admin on Discord");
                        electron_1.app.quit();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    });
    authWin.on('closed', function () {
        authWin = null;
    });
    return authWin;
}
exports.createAuthWindow = createAuthWindow;
function updateLoadStatus(win, message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    win.webContents.send('yourmom', { 'status': message });
                    return [4 /*yield*/, sleep(500)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var bankPath, loadingWin;
        var _this = this;
        return __generator(this, function (_a) {
            bankPath = path.normalize('c:/users/dfitz/onedrive/desktop/ZoneControlCE.SC2Bank');
            client = new objects_1.default();
            loadingWin = createScanningWindow();
            confirmWin = createConfirmPathDialog();
            client.settings.set('gamePath', undefined);
            client.settings.set('token', null);
            client.settings.save();
            confirmWin.loadFile(path.join(__dirname, '../src/pages/changeDirectory/changeDirectory.html'));
            loadingWin.webContents.on('did-finish-load', function () { return __awaiter(_this, void 0, void 0, function () {
                var gamePath, err_2, status_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            loadingWin.show();
                            gamePath = client.settings.get('gamePath');
                            client.path = gamePath;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 7]);
                            return [4 /*yield*/, client.load()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, authenticate()];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 7];
                        case 4:
                            err_2 = _a.sent();
                            return [4 /*yield*/, updateLoadStatus(loadingWin, "Scanning for SC2")];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, client.detectPath()];
                        case 6:
                            gamePath = _a.sent();
                            console.log(gamePath);
                            status_1 = gamePath === undefined ?
                                "We could not find your game directory. Please manually choose it."
                                : "We automatically detected your game directory below. Please confirm.";
                            confirmWin.webContents.send('updateStatus', {
                                status: status_1,
                                gamePath: gamePath,
                            });
                            confirmWin.show();
                            loadingWin.hide();
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
;
function authenticate() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var authenticated, err_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, client.authenticate()];
                            case 1:
                                authenticated = _a.sent();
                                if (authenticated) {
                                    mainWin = createMainWindow();
                                    resolve();
                                }
                                else {
                                    authWin = createAuthWindow();
                                }
                                return [3 /*break*/, 3];
                            case 2:
                                err_3 = _a.sent();
                                authWin = createAuthWindow();
                                console.log("Could not authenticate properly");
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
electron_1.ipcMain.on('browseDirectory', function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dialog.showOpenDialog(confirmWin, {
                    properties: ['openDirectory']
                })];
            case 1:
                result = _a.sent();
                if (!result.canceled) {
                    confirmWin.webContents.send('updateStatus', {
                        status: "Please confirm your chosen directory",
                        gamePath: result.filePaths[0]
                    });
                }
                return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on('confirmDirectory', function (event, gamePath) { return __awaiter(void 0, void 0, void 0, function () {
    var err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client.path = gamePath;
                updateLoadStatus(loadingWin, "Mapping Accounts");
                confirmWin.hide();
                loadingWin.show();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, client.load()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_4 = _a.sent();
                confirmWin.webContents.send('updateStatus', {
                    status: err_4,
                    gamePath: gamePath
                });
                confirmWin.show();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', main);
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        main();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//# sourceMappingURL=index.js.map