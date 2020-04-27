import axios, { AxiosInstance } from 'axios'
import Client from './objects'

const local = false
console.log("Local API Set to: " + local)
let api_base: string
let accounts_base: string
if (local) {
     api_base = 'http://localhost:8000/api/'
     accounts_base = 'http://localhost:8000/accounts/'
} else {
    api_base = 'https://zclweb.herokuapp.com/api/'
    accounts_base = 'https://zclweb.herokuapp.com/accounts/'
}

    


interface Replay {
    id: number,
    game_id: string,
    created: string,
    updated: string,
    file: string,
    description: string,
    matchID: number,
    profile: null
}
interface DiscordUser {
    id: number,
    created: string,
    username: string,
    discriminator: string,
    avatar: string
}
export interface User {
    id: number,
    avatar_url: string,
    created: string,
    last_login: string,
    is_superuser: boolean,
    first_name: string,
    last_name: string,
    is_staff: boolean,
    is_active: boolean,
    date_joined: string,
    updated: string,
    username: string,
    email: string,
    discriminator: number,
    avatar: string,
    groups: [],
    user_permissions: []
}
export interface CurrentUser {
    authorized: boolean,
    token: string,
    details: User
}
export interface ExchangeUser {
    // API Response from the /exchange endpoint
    user: DiscordUser,
    token: string

}
export interface ExchangeError {
    error: string,
}

export class Api {
    private api: AxiosInstance
    private accounts: AxiosInstance
    private headers: {[x: string]: any} = {}
    private client: Client
    
    constructor(client: Client) {
        this.client = client
        // get token
         let token = this.client.settings.get('token')
         this.headers = {
             'Content-Type': 'application/json',
         }

        this.api = axios.create({
            baseURL: api_base,
            headers: this.headers
        })
        this.accounts = axios.create({
            baseURL: accounts_base,
            headers: this.headers
        })
        this.api.interceptors.request.use((config) => {
            this.updateHeaders()
            config.url += '/'
            return config
        })
        this.accounts.interceptors.request.use((config) => {
            this.updateHeaders()
            config.url += '/'
            return config
        })      
    }
    public async updateHeaders() {
        return new Promise((resolve, reject) => {
            const token = this.client.settings.get('token')
        this.headers = {
            'Content-Type': 'application/json',
        }
        if (token !== null) {
            this.headers['Authorization'] = `Token ${token}`
        }
        resolve()
        })
        
    }
    // ===================================
    // Account endpoint api calls
    // ===================================
    public async exchangeToken(token: string) {

        const payload = {token: token}
        const response = await this.accounts.post('exchange', JSON.stringify(payload))
        if ('error' in response.data) throw new Error(response.data)
        return response.data
     
       
        
   
        
    }
    public async me(): Promise<CurrentUser> {
        const response = await this.accounts.get('me', {
            headers: this.headers
        })
        return response.data
    }
    // ===================================
    // api endpoint api calls
    // ===================================
    public async getReplays() {
        const response = await this.api.get('replays')
        return response.data
    }
  
    public async addSmurf(profileId: string) {
        const user: User = this.client.settings.get('user')
        const payload = {id: profileId}
        const target = `users/${user.id}/toons`
        try {
            await this.api.post(target, payload, {
                headers: this.headers
            })
        } catch (err) {
            //console.log(err)
        }
        
    }
    public async uploadReplay(obj: Buffer) {
        const headers = {
            ...this.headers,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': "raw; filename='temp'"
        }
        await this.api.post('replayupload', obj, { 
                headers: headers
            })
    }
    public async uploadBank(obj: Buffer) {
        const headers = {
            ...this.headers,
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': "raw; filename='temp'"
        }
        await this.api.post('banks', obj, { 
                headers: headers
            })
    }
    public async matchStart(payload: any) {
        const response = await this.api.post('automatch', {
            data: payload,
            headers: this.headers
        })
        return response.data
    }

}
