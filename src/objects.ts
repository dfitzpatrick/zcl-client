import pathlib = require('path');
import { Api } from './api'
import _ = require('lodash');
import Settings from './settings'
import GameEvents from './gameEvents'
import { platform } from 'os';
import { isNull } from 'util';
import { Stats } from 'fs';
const username = require('username')
const fetch = require("node-fetch");
var xpath = require('xpath'),
    dom   = require('xmldom').DOMParser;
const TRACKED_GAMES: string[] = [
    '1-S2-1-4632373' // ZC CE
];
const fs = require('fs').promises;

export const http = <T>(req: RequestInfo): Promise<T> =>
  fetch(req).then((res: any) => res.json());

export const folderUpName = (path: string) => {
    return pathlib.normalize(pathlib.dirname(path).split(pathlib.sep).pop())
}
export const directoryExists = async (path: string) => {
    try {
        fs.stat(path).then((stats:Stats) => {return stats.isDirectory()})
    } catch (err) {
        console.log(err)
        return false
    }
}

interface Event {
    type: string;
}
export interface EventPayload {
    game: Game,
    event: Event
}
async function sleep(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class AsyncQueue<T> {
    private _promises: Promise<T>[] = [];
    private _resolvers: ((t: T) => void)[] = [];

    constructor() {}

    private _addPromise() {
        this._promises.push(
            new Promise(resolve => {
                this._resolvers.push(resolve)
            })
        );
    }
    public enqueue(item: T) {
        if (!this._resolvers.length) {
            this._addPromise();
        }
        const resolve = this._resolvers.shift();
        resolve(item);
    }
    public dequeue() {
        if (!this._promises.length) {
            this._addPromise();
        }
        const promise = this._promises.shift();
        return promise;
    }
    public isEmpty() {
        return !this._promises.length;
    }
}
class EventCache<T> extends Array<T> {
    maxSize: number = 10;
    constructor(items?: Array<T>, maxSize: number = 10) {
        super(...items);
        this.maxSize = maxSize;
        Object.setPrototypeOf(this, EventCache.prototype);
    }
    public add(o: T) {
        this.push(o);
        if (this.length > this.maxSize) {
            this.shift();
        }
    }
    public containsEvent(o: T) {
        // TODO: Expensive. How to best
        // check for membership of two JSON objects?
        for (let e of this) {
            if (_.isEqual(o, e)) {
                return true;
            }
        }
        return false;

    }
}
class Profile {
    path: string
    id: string
    accountId: string
    replayDir: string
    constructor(path: string) {
        this.path = path
        this.id = path.substring(path.lastIndexOf(pathlib.sep)+1)
        this.accountId = folderUpName(this.path)
        this.replayDir = pathlib.join(this.path, 'Replays/Multiplayer')
    }
}

class Game {
    path: string;
    eventFile: string;
    bankFile: string;
    id: string;
    tracked: boolean;
    profile: Profile
    profileId: string;
    replayDir: string;
    constructor(path: string) {
        this.path = path;
        this.id = path.substring(path.lastIndexOf(pathlib.sep)+1);
        this.eventFile = pathlib.normalize(this.path + pathlib.sep + 'Events.SC2Bank')
        this.bankFile = pathlib.normalize(this.path + pathlib.sep + 'ZoneControlCE.SC2Bank')
        this.tracked = TRACKED_GAMES.includes(this.id);
        this.profile = new Profile(pathlib.dirname(this.path))
        this.profileId = folderUpName(pathlib.dirname(this.path));
        this.replayDir = pathlib.join(this.path, 'Replays/Multiplayer')
    }
    public async lastEvent(path: string = this.eventFile) {
        const data = (await fs.readFile(path, {encoding: 'utf8'})).toString();
        var re_pattern = '';
        var document = new dom().parseFromString(data, 'text/xml');
        var search = "//Key/@name[not(. < //Key/@name)]";
        var key = xpath.select1(search, document).value;
        search = `//Key[@name='${key}']/Value/@text`
        var result = xpath.select1(search, document).value;
        result = result.replace(/,(?=\s+[]}])/g, "").replace(/`/g, '"');
        result = JSON.parse(result);
        // get game id and annotate
        var gameId = xpath.select1('//Section/@name', document).value;
        result.game_id = Number(gameId);
        return result
        
    }
}
class Client {
    path: string;
    games: Game[] = [];
    profiles: Profile[] = []
    queue: AsyncQueue<EventPayload> = new AsyncQueue();
    chokidar: Object;
    eventCache: EventCache<Event> = new EventCache<Event>(); // To keep out duplicates
    settings: Settings
    gameEvents: GameEvents
    api: Api

    constructor() {
        this.path = ""
        this.settings = new Settings()
        this.api = new Api(this)
        this.gameEvents = new GameEvents(this)
        
    }
    public async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    public async load() {
        return new Promise(async (resolve, reject) => {
            console.log('path is set as: ' + this.path)
            if (typeof this.path !== "string") {
                reject(this)
                return
            }
            var finder = require('findit')(this.path)
            finder.on('directory', async (dir: any) => {
                if (this._isAccountDir(dir)) {
                    this.profiles.push(new Profile(dir))
                }
                if (this._isGameDir(dir)) {
                    this.games.push(new Game(dir));
                }
            })
            finder.on('error', (err: any) => {
                
            })
            finder.on('end', () => {
                if (this.profiles.length <= 0) {
                    reject(this)
                    return
                }
                this.dispatcher()
                resolve(this)
            })

        })
    }


    private _isGameDir(path: string) {
        return folderUpName(path).toLowerCase() == "banks";
    }
    private _isAccountDir(path: string) {
        const id = path.substring(path.lastIndexOf(pathlib.sep)+1);
        const isAccount = folderUpName(pathlib.dirname(path)).toLowerCase() == 'accounts'
        const isId = (id.match(/-/g)||[]).length == 3
        return isAccount && isId
    }
    public linkSmurf(profile: Profile): void {
       this.api.addSmurf(profile.id).then(() =>{
       })
    }
    public linkSmurfs(): void {
        for (const p of this.profiles) {
            this.linkSmurf(p)
        }
    }
    public gameFromEventPath(path: string) {
        for (let g of this.games) {
            if (g.eventFile == path) { return g }
        }
    }
    public trackedGames() {
        var container = [];
        for (let g of this.games) {
            if (g.tracked) {
                container.push(g)
            }
        }
        return container;
    }
    
    public async detectPath(): Promise<string> {
        let root = ""
        const user = await username()
        if (process.platform === 'win32') {
            root = 'c:/Users/' + user
        } else if (process.platform === 'darwin') {
            root = user + '/Library'
        }
        if (root === "") {
            return ""
        }
        return new Promise((resolve, reject) => {
            var finder = require('findit')(root)
            finder.on('directory', async (dir: any) => {
                if (this._isAccountDir(dir)) {
                    const found = pathlib.normalize(
                        pathlib.dirname(pathlib.dirname(pathlib.dirname(dir)))
                    )
                    finder.stop()
                    resolve(found)
                }
            })
            finder.on('error', (err: any) => {
                
            })
            finder.on('end', () => {
                resolve(undefined)
            })

        })
        
    }
    public async dispatcher() {
        // Dispatches events in the queue to the API
        while (true) {
            var item = await this.queue.dequeue();
            
            if (this.eventCache.containsEvent(item.event)) {
                // TODO: Fix this madness. This is an expensive
                // bruteforce way to compare two JSON objects.
                // This is because most watchers duplicate change events.
                continue;
            }            
            try { 
                await this.gameEvents[item.event.type](item)
            } catch (err) {
                await this.gameEvents['on_error'](item)
            }
                //actions[item.type](item);
            this.eventCache.add(item.event);

        }   
    }
    public async watch() {
        const chokidar = require('chokidar');
        var watcher = chokidar.watch(this.path, 
            {
                persistent: true, 
                ignoreInitial: true
            }
        );
        watcher
        .on('change', async (path: string) => {
            console.log('detected change')
            const game = this.gameFromEventPath(path);
            if (game) {
                const event = await game.lastEvent()
                const payload: EventPayload = {
                    game: game,
                    event: event,
                }
                this.queue.enqueue(payload);
            }
        })
        .on('add', (path: string) => {
            
            if (folderUpName(path).toLowerCase() == 'multiplayer') {
                // ignore multiple adds for a replay as the file is still being generated.
                _.debounce(this.newReplay.bind(this), 5000)(path);
            }
        });

    }
    public async authenticate(): Promise<boolean> {
        // Get token or make sure its still valid
        const token = this.settings.get('token')
        console.log('token is: ' + token)
        if (token !== null) {
            try {
                await this.api.updateHeaders()
                const user = await this.api.me()
                this.settings.set('user', user)
                this.settings.save()
                console.log('user authorized: ' + user.authorized)
                return true
            } catch (err) {
                //To do. User is not authorized for this app due to either
                // 1. Unverified account
                // 2. Revolked Access Token
                console.log(err)
            }
        }

        return false
    }
    public async newReplay(path: string) {
        console.log('New replay ' + path)
        //console.log(this.api)
        let fo = await fs.readFile(path)
        await this.api.uploadReplay(fo)
    
        let localManifest = this.settings.get('localManifest')
        localManifest.push(path)
        this.settings.set('localManifest', localManifest)
        this.settings.save()
            
    }
    public async syncReplays() {
        for (const p of this.profiles) {
            var localManifest = this.settings.get('localManifest')

            //return
            let files = await fs.readdir(p.replayDir)
            for (const f of files) {
                
                let replayPath = pathlib.join(p.replayDir, f)
                if (localManifest.includes(replayPath.toString())) {
                    continue
                }
                if (!f.startsWith('Zone Control CE')) {
                    continue
                }   
                // Parse the replay and send it to the server
                console.log(replayPath)
                await this.newReplay(replayPath)
                await sleep(5000)
            }

        }

    }
}


export default Client;