"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron = require("electron");
var path = require("path");
var fs = require("fs");
var Settings = /** @class */ (function () {
    function Settings() {
        this.userDataPath = (electron.app || electron.remote.app).getPath("userData");
        this.settingsFile = path.join(this.userDataPath, 'zclclient.json');
        this.data = this.readFile();
    }
    Settings.prototype.readFile = function () {
        try {
            var buffer = fs.readFileSync(this.settingsFile);
            return JSON.parse(buffer.toString());
        }
        catch (err) {
            console.log("Settings file could not load: " + err);
            return {};
        }
    };
    Settings.prototype.save = function () {
        var data = JSON.stringify(this.data);
        var buffer = fs.writeFileSync(this.settingsFile, data);
    };
    Settings.prototype.set = function (key, value) {
        this.data[key] = value;
    };
    Settings.prototype.get = function (key) {
        try {
            return this.data[key];
        }
        catch (err) {
            return null;
        }
    };
    return Settings;
}());
exports.default = Settings;
//# sourceMappingURL=settings.js.map