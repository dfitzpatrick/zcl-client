"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var pathlib = require("path");
var api_1 = require("./api");
var _ = require("lodash");
var settings_1 = require("./settings");
var gameEvents_1 = require("./gameEvents");
var username = require('username');
var fetch = require("node-fetch");
var xpath = require('xpath'), dom = require('xmldom').DOMParser;
var TRACKED_GAMES = [
    '1-S2-1-4632373' // ZC CE
];
var fs = require('fs').promises;
exports.http = function (req) {
    return fetch(req).then(function (res) { return res.json(); });
};
exports.folderUpName = function (path) {
    return pathlib.normalize(pathlib.dirname(path).split(pathlib.sep).pop());
};
exports.directoryExists = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            fs.stat(path).then(function (stats) { return stats.isDirectory(); });
        }
        catch (err) {
            console.log(err);
            return [2 /*return*/, false];
        }
        return [2 /*return*/];
    });
}); };
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
var AsyncQueue = /** @class */ (function () {
    function AsyncQueue() {
        this._promises = [];
        this._resolvers = [];
    }
    AsyncQueue.prototype._addPromise = function () {
        var _this = this;
        this._promises.push(new Promise(function (resolve) {
            _this._resolvers.push(resolve);
        }));
    };
    AsyncQueue.prototype.enqueue = function (item) {
        if (!this._resolvers.length) {
            this._addPromise();
        }
        var resolve = this._resolvers.shift();
        resolve(item);
    };
    AsyncQueue.prototype.dequeue = function () {
        if (!this._promises.length) {
            this._addPromise();
        }
        var promise = this._promises.shift();
        return promise;
    };
    AsyncQueue.prototype.isEmpty = function () {
        return !this._promises.length;
    };
    return AsyncQueue;
}());
var EventCache = /** @class */ (function (_super) {
    __extends(EventCache, _super);
    function EventCache(items, maxSize) {
        if (maxSize === void 0) { maxSize = 10; }
        var _this = _super.apply(this, items) || this;
        _this.maxSize = 10;
        _this.maxSize = maxSize;
        Object.setPrototypeOf(_this, EventCache.prototype);
        return _this;
    }
    EventCache.prototype.add = function (o) {
        this.push(o);
        if (this.length > this.maxSize) {
            this.shift();
        }
    };
    EventCache.prototype.containsEvent = function (o) {
        // TODO: Expensive. How to best
        // check for membership of two JSON objects?
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var e = _a[_i];
            if (_.isEqual(o, e)) {
                return true;
            }
        }
        return false;
    };
    return EventCache;
}(Array));
var Profile = /** @class */ (function () {
    function Profile(path) {
        this.path = path;
        this.id = path.substring(path.lastIndexOf(pathlib.sep) + 1);
        this.accountId = exports.folderUpName(this.path);
        this.replayDir = pathlib.join(this.path, 'Replays/Multiplayer');
    }
    return Profile;
}());
var Game = /** @class */ (function () {
    function Game(path) {
        this.path = path;
        this.id = path.substring(path.lastIndexOf(pathlib.sep) + 1);
        this.eventFile = pathlib.normalize(this.path + pathlib.sep + 'Events.SC2Bank');
        this.tracked = TRACKED_GAMES.includes(this.id);
        this.profile = new Profile(pathlib.dirname(this.path));
        this.profileId = exports.folderUpName(pathlib.dirname(this.path));
        this.replayDir = pathlib.join(this.path, 'Replays/Multiplayer');
    }
    Game.prototype.lastEvent = function (path) {
        if (path === void 0) { path = this.eventFile; }
        return __awaiter(this, void 0, void 0, function () {
            var data, re_pattern, document, search, key, result, gameId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.readFile(path, { encoding: 'utf8' })];
                    case 1:
                        data = (_a.sent()).toString();
                        re_pattern = '';
                        document = new dom().parseFromString(data, 'text/xml');
                        search = "//Key/@name[not(. < //Key/@name)]";
                        key = xpath.select1(search, document).value;
                        search = "//Key[@name='" + key + "']/Value/@text";
                        result = xpath.select1(search, document).value;
                        result = result.replace(/,(?=\s+[]}])/g, "").replace(/`/g, '"');
                        result = JSON.parse(result);
                        gameId = xpath.select1('//Section/@name', document).value;
                        result.game_id = Number(gameId);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return Game;
}());
var Client = /** @class */ (function () {
    function Client() {
        this.games = [];
        this.profiles = [];
        this.queue = new AsyncQueue();
        this.eventCache = new EventCache(); // To keep out duplicates
        this.path = null;
        this.settings = new settings_1.default();
        this.api = new api_1.Api(this);
        this.gameEvents = new gameEvents_1.default(this);
    }
    Client.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var path;
            var _this = this;
            return __generator(this, function (_a) {
                path = this.path;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var listeners = {
                            directories: function (root, stats, next) {
                                for (var _i = 0, stats_1 = stats; _i < stats_1.length; _i++) {
                                    var stat = stats_1[_i];
                                    if (stat.type != 'directory')
                                        continue;
                                    var statspath = pathlib.normalize(root + pathlib.sep + stat.name);
                                    if (_this._isAccountDir(statspath)) {
                                        _this.profiles.push(new Profile(statspath));
                                    }
                                    if (_this._isGameDir(statspath)) {
                                        _this.games.push(new Game(statspath));
                                    }
                                }
                                next();
                            }
                        };
                        try {
                            require('walk').walkSync(path, { listeners: listeners });
                            if (_this.profiles.length <= 0) {
                                reject("No profiles detected");
                            }
                            console.log('done');
                            _this.dispatcher();
                            resolve(_this);
                        }
                        catch (err) {
                            reject(err);
                        }
                    })];
            });
        });
    };
    Client.prototype._isGameDir = function (path) {
        return exports.folderUpName(path).toLowerCase() == "banks";
    };
    Client.prototype._isAccountDir = function (path) {
        var id = path.substring(path.lastIndexOf(pathlib.sep) + 1);
        var isAccount = exports.folderUpName(pathlib.dirname(path)).toLowerCase() == 'accounts';
        var isId = (id.match(/-/g) || []).length == 3;
        return isAccount && isId;
    };
    Client.prototype.linkSmurf = function (profile) {
        this.api.addSmurf(profile.id).then(function () {
        });
    };
    Client.prototype.linkSmurfs = function () {
        for (var _i = 0, _a = this.profiles; _i < _a.length; _i++) {
            var p = _a[_i];
            this.linkSmurf(p);
        }
    };
    Client.prototype.gameFromEventPath = function (path) {
        for (var _i = 0, _a = this.games; _i < _a.length; _i++) {
            var g = _a[_i];
            if (g.eventFile == path) {
                return g;
            }
        }
    };
    Client.prototype.trackedGames = function () {
        var container = [];
        for (var _i = 0, _a = this.games; _i < _a.length; _i++) {
            var g = _a[_i];
            if (g.tracked) {
                container.push(g);
            }
        }
        return container;
    };
    Client.prototype.detectPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var root, user;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        root = "";
                        return [4 /*yield*/, username()];
                    case 1:
                        user = _a.sent();
                        if (process.platform === 'win32') {
                            root = 'c:/Users/' + user;
                        }
                        else if (process.platform === 'darwin') {
                            root = user + '/Library';
                        }
                        if (root === "") {
                            return [2 /*return*/, ""];
                        }
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var finder = require('findit')(root);
                                finder.on('directory', function (dir) { return __awaiter(_this, void 0, void 0, function () {
                                    var found;
                                    return __generator(this, function (_a) {
                                        if (this._isAccountDir(dir)) {
                                            found = pathlib.normalize(pathlib.dirname(pathlib.dirname(pathlib.dirname(dir))));
                                            finder.stop();
                                            resolve(found);
                                        }
                                        return [2 /*return*/];
                                    });
                                }); });
                                finder.on('error', function (err) {
                                });
                                finder.on('end', function () {
                                    resolve(undefined);
                                });
                            })];
                }
            });
        });
    };
    Client.prototype.dispatcher = function () {
        return __awaiter(this, void 0, void 0, function () {
            var actions, item, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actions = {
                            match_start: matchStart,
                            player_leave: playerLeave,
                        };
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.queue.dequeue()];
                    case 2:
                        item = _a.sent();
                        if (this.eventCache.containsEvent(item)) {
                            // TODO: Fix this madness. This is an expensive
                            // bruteforce way to compare two JSON objects.
                            // This is because most watchers duplicate change events.
                            return [3 /*break*/, 1];
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 7]);
                        return [4 /*yield*/, this.gameEvents[item.type](item)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        err_1 = _a.sent();
                        return [4 /*yield*/, this.gameEvents['on_error'](item)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        //actions[item.type](item);
                        this.eventCache.add(item);
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.watch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chokidar, watcher;
            var _this = this;
            return __generator(this, function (_a) {
                chokidar = require('chokidar');
                watcher = chokidar.watch(this.path, {
                    persistent: true,
                    ignoreInitial: true
                });
                watcher
                    .on('change', function (path) { return __awaiter(_this, void 0, void 0, function () {
                    var game, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                game = this.gameFromEventPath(path);
                                if (!game) return [3 /*break*/, 2];
                                _b = (_a = this.queue).enqueue;
                                return [4 /*yield*/, game.lastEvent()];
                            case 1:
                                _b.apply(_a, [_c.sent()]);
                                _c.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                }); })
                    .on('add', function (path) {
                    if (exports.folderUpName(path).toLowerCase() == 'multiplayer') {
                        // ignore multiple adds for a replay as the file is still being generated.
                        _.debounce(_this.newReplay, 5000)(path);
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    Client.prototype.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token, user, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = this.settings.get('token');
                        console.log('token is: ' + token);
                        if (!(token !== null)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.api.updateHeaders()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.api.me()];
                    case 3:
                        user = _a.sent();
                        this.settings.set('user', user);
                        this.settings.save();
                        console.log('user authorized: ' + user.authorized);
                        return [2 /*return*/, true];
                    case 4:
                        err_2 = _a.sent();
                        //To do. User is not authorized for this app due to either
                        // 1. Unverified account
                        // 2. Revolked Access Token
                        console.log(err_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, false];
                }
            });
        });
    };
    Client.prototype.newReplay = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var fo, localManifest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.readFile(path)];
                    case 1:
                        fo = _a.sent();
                        return [4 /*yield*/, this.api.uploadReplay(fo)];
                    case 2:
                        _a.sent();
                        localManifest = this.settings.get('localManifest');
                        localManifest.push(path);
                        this.settings.set('localManifest', localManifest);
                        this.settings.save();
                        return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.syncReplays = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, p, localManifest, files, _b, files_1, f, replayPath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = this.profiles;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        p = _a[_i];
                        localManifest = this.settings.get('localManifest');
                        return [4 /*yield*/, fs.readdir(p.replayDir)];
                    case 2:
                        files = _c.sent();
                        _b = 0, files_1 = files;
                        _c.label = 3;
                    case 3:
                        if (!(_b < files_1.length)) return [3 /*break*/, 7];
                        f = files_1[_b];
                        replayPath = pathlib.join(p.replayDir, f);
                        if (localManifest.includes(replayPath.toString())) {
                            return [3 /*break*/, 6];
                        }
                        if (!f.startsWith('Zone Control CE')) {
                            return [3 /*break*/, 6];
                        }
                        // Parse the replay and send it to the server
                        console.log(replayPath);
                        return [4 /*yield*/, this.newReplay(replayPath)];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, sleep(5000)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        _b++;
                        return [3 /*break*/, 3];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return Client;
}());
var matchStart = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fetch('http://localhost:8000/api/automatch/', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token 51dea4eb6dfead2ce65ec88e8efbdb90cd134be1',
            },
            method: 'post',
            body: JSON.stringify(payload),
        }).then(function (res) {
            console.log('api result: ' + res.status);
        });
        return [2 /*return*/];
    });
}); };
var playerLeave = function (payload) {
    return;
};
exports.default = Client;
//# sourceMappingURL=objects.js.map