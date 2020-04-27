import Client from "./objects";
import {EventPayload} from './objects'
const fs = require('fs').promises

export default class GameEvents {
    [func: string]: any
    private client: Client
    constructor(client: Client) {
        this.client = client
    }

    public async match_start(payload: EventPayload) {
        console.log('in match start')
        await this.client.api.matchStart(payload.event)
        
    }
    public async match_end(payload: EventPayload) { 
        console.log('in match end')
        await this.client.sleep(5000)
        const fo = await fs.readFile(payload.game.bankFile)
        await this.client.api.uploadBank(fo)  
    }
    public async on_error(payload: EventPayload) {
        console.log('no function defined ' + payload.event.type)
    }
}
