import Client from "./objects";
import {EventPayload} from './objects'
const fs = require('fs').promises

export default class GameEvents {
    [func: string]: any
    private client: Client
    constructor(client: Client) {
        this.client = client
    }

    public async match_end(payload: EventPayload) { 
        console.log('in match end')
        await this.on_event(payload) 

        // Wait some time just to make sure the bank is fully updated and send.
        await this.client.sleep(5000)
        const fo = await fs.readFile(payload.game.bankFile)
        await this.client.api.uploadBank(fo) 
       
    }
    
    public async on_event(payload: EventPayload) {
        await this.client.api.genericEvent(payload.event)
    }
}
