"use strict";
// Just roll our own Implicit Grant 
Object.defineProperty(exports, "__esModule", { value: true });
var DiscordImplictGrant = /** @class */ (function () {
    function DiscordImplictGrant(clientId) {
        var _this = this;
        this.url = "https://discordapp.com/api/oauth2/authorize";
        this.clientId = "485951338518282251";
        this.callbackUrl = "http://localhost/";
        this.loginButton = document.getElementById("login");
        if (clientId) {
            this.clientId = clientId;
        }
        this.loginButton.addEventListener('click', function (e) {
            _this.authorize();
            e.preventDefault();
        });
    }
    DiscordImplictGrant.prototype.authorize = function () {
        console.log('in authorize');
        var target = this.url + "?response_type=token&client_id=" + this.clientId + "&scope=email&redirect_uri=" + this.callbackUrl;
        console.log(target);
        //window.location.href = target;
    };
    return DiscordImplictGrant;
}());
exports.DiscordImplictGrant = DiscordImplictGrant;
var app = new DiscordImplictGrant();
//# sourceMappingURL=implicit.js.map