import electron = require('electron')
import path = require('path')
import fs = require('fs')

class Settings {
    userDataPath: string
    settingsFile: string
    data: {
        [key: string]: any
    }
    constructor() {
        this.userDataPath = (electron.app || electron.remote.app).getPath("userData")
        this.settingsFile = path.join(this. userDataPath, 'zclclient.json')
        this.data = this.readFile()

    }
    readFile(): Object {
        try {
            var buffer = fs.readFileSync(this.settingsFile)
            return JSON.parse(buffer.toString())
        } catch (err) {
            console.log("Settings file could not load: " + err)
            return {}
        }
    }
    save(): void {
        var data = JSON.stringify(this.data)
        var buffer = fs.writeFileSync(this.settingsFile, data)
    }
    set(key: string, value: any): void {
        this.data[key] = value
    }
    get(key: string): any | null {
        try {
            return this.data[key]
        }catch (err) {
            return null
        }
        
    }
}
export default Settings
