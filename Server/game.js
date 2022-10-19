//

class Game {
    static takenCodes = [];
    static games = {};

    static getGame(code) {
        return Game.games[code];
    }

    constructor() {
        this.code = this.generateCode();
        this.players = [];
        Game.games[this.code] = this;
        this.rules = {
            maxLives: 3,
            maxAcid: 5,
            maxTime: 180,
        };
        this.state = {
            started: false,
            start_time: null,
            finished: false,
            winner: null,
        };
    }

    generateCode() {
        // Generates a 7 character code
        let code = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (let i = 0; i < 7; i++) {
            code += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );
        }
        if (Game.takenCodes.includes(code)) {
            return this.generateCode();
        }
        Game.takenCodes.push(code);
        return code;
    }

    getObject() {
        let players = [];

        for (let player of this.players) {
            players.push(player.getObject());
        }

        return {
            code: this.code,
            players: players,
            rules: this.rules,
            state: this.state,
        };
    }

    sendUpdate(name, msg) {
        for (let player of this.players) {
            player.socket.emit(name, msg);
        }
    }
}

class Player {
    static takenIds = [];
    static players = {};

    static getPlayer(id) {
        return Player.players[id];
    }

    constructor(name, socket, game) {
        this.name = name;
        this.socket = socket;

        this.id = this.generateId();

        this.host = false;

        game.players.push(this);
        Player.players[this.id] = this;

        this.lives = 3;
        this.acid = 5;

        this.hidden = true;

        this.points = 0;
        this.placement = null;
    }

    generateId() {
        // Generate a random 32 digit numerical id
        let id = "";
        const possible = "0123456789";
        for (let i = 0; i < 32; i++) {
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        if (Player.takenIds.includes(id)) {
            return this.generateId();
        }
        Player.takenIds.push(id);
        return id;
    }

    getObject() {
        return {
            id: this.id,
            name: this.name,
            host: this.host,
            lives: this.lives,
            acid: this.acid,
            hidden: this.hidden,
            points: this.points,
            placement: this.placement,
        };
    }
}

module.exports = {
    Game: Game,
    Player: Player,
};