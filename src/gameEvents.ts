import Client from "./objects";

export default class GameEvents {
    [func: string]: any
    private client: Client
    constructor(client: Client) {
        this.client = client
    }

    public async match_start(payload: any) {
        console.log('in match start')
    }
    public async on_error(payload: any) {
        console.log('no function defined ' + payload.type)
    }
}
