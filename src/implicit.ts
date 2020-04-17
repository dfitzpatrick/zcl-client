// Just roll our own Implicit Grant 

export class DiscordImplictGrant {
    url: string = "https://discordapp.com/api/oauth2/authorize";
    clientId: string = "485951338518282251";
    callbackUrl: string = "http://localhost/";

    private loginButton = document.getElementById("login");
    constructor(clientId?: string) {
        if (clientId) {
            this.clientId = clientId;
        }
        this.loginButton.addEventListener('click', (e) => {
            this.authorize();
            e.preventDefault();
        })
    }

    public authorize() {
        console.log('in authorize');
        var target = `${this.url}?response_type=token&client_id=${this.clientId}&scope=email&redirect_uri=${this.callbackUrl}`
        console.log(target);
        //window.location.href = target;
    }

}
var app = new DiscordImplictGrant();