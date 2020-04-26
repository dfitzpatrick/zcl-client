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
var axios_1 = require("axios");
var api_base = "http://localhost:8000/api";
var accounts_base = "http://localhost:8000/accounts";
function exchangeToken(discordToken) {
    return __awaiter(this, void 0, void 0, function () {
        var url, payload, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = accounts_base + '/exchange';
                    payload = {
                        token: discordToken
                    };
                    return [4 /*yield*/, axios_1.default.post(url, payload)];
                case 1:
                    response = _a.sent();
                    if ('error' in response.data)
                        throw new Error(response.data);
                    return [2 /*return*/, response.data];
            }
        });
    });
}
exports.exchangeToken = exchangeToken;
function getReplays() {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = api_base + '/replays/';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    err_1 = _a.sent();
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getReplays = getReplays;
function me(token) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = api_base + '/current_user';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: {
                                'Authorization': "Token " + token
                            }
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    err_2 = _a.sent();
                    throw err_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.me = me;
function addSmurf(profileId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, url, payload, response, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = "224734305581137921";
                    url = api_base + ("/users/" + user + "/toons/");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    payload = {
                        id: profileId
                    };
                    console.log('calling axios');
                    return [4 /*yield*/, axios_1.default.post(url, payload, {
                            headers: {
                                'Authorization': 'Token 51dea4eb6dfead2ce65ec88e8efbdb90cd134be1'
                            }
                        })];
                case 2:
                    response = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.log(err_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.addSmurf = addSmurf;
function getReplayManifest() {
    return __awaiter(this, void 0, void 0, function () {
        var replays, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getReplays()];
                case 1:
                    replays = _a.sent();
                    return [2 /*return*/, replays.map(function (r) { return r.game_id; })];
                case 2:
                    err_4 = _a.sent();
                    throw err_4;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getReplayManifest = getReplayManifest;
function uploadReplay(obj) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = api_base + '/replayupload/';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(url, obj, {
                            headers: {
                                'Content-Type': 'application/octet-stream',
                                'Content-Disposition': "raw; filename='yourmom'"
                            }
                        })];
                case 2:
                    response = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_5 = _a.sent();
                    throw err_5;
                case 4: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1000); })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.uploadReplay = uploadReplay;
function matchStart(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = api_base + '/automatch/';
                    return [4 /*yield*/, axios_1.default.post(url, payload, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'foo'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.matchStart = matchStart;
//# sourceMappingURL=api_old.js.map