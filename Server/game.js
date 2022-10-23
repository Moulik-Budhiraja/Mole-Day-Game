//

class Game {
    static takenCodes = [];
    static games = {};

    static getGame(code) {
        return Game.games[code];
    }

    constructor() {
        this.code = this.generateCode();
        Game.games[this.code] = this;
        this.rules = {
            maxLives: 3,
            maxAcid: 5,
            maxTime: 180,
            startDelay: 0,
        };
        this.state = {
            started: false,
            start_time: null,
            finished: false,
            winner: null,
        };
        this.players = [];
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

    start() {
        this.sendUpdate("load-game", {
            data: {
                game: this.getObject(),
            },
        });

        setTimeout(() => {
            this.sendUpdate("start-countdown", {
                data: {
                    game: this.getObject(),
                },
            });
        }, 1000);

        setTimeout(() => {
            this.state.started = true;
            this.state.start_time = Date.now();
            this.sendUpdate("game-started", {
                data: {
                    game: this.getObject(),
                },
            });
            this.registerGameEvents();

            this.updateVisiblePlayers();
        }, 1000 + this.rules.startDelay * 1000);
    }

    registerGameEvents() {
        for (let player of this.players) {
            player.registerEvents();
        }
    }

    getAlivePlayers() {
        let alive = [];

        for (let player of this.players) {
            if (player.lives > 0) {
                alive.push(player);
            }
        }

        return alive;
    }

    getVisiblePlayers(exclude = null) {
        let players = [];

        for (let player of this.getAlivePlayers()) {
            if (player.id != exclude) {
                players.push(player.getObject());
            }
        }

        return players;
    }

    getSetVisiblePlayers(exclude = null) {
        // Return a random set of upto 4 players that are visible

        let players = this.getVisiblePlayers(exclude);

        let maxSetSize = Math.floor(Math.random() * 4) + 1;
        let set = [];

        while (set.length < 5 && players.length > 0) {
            let index = Math.floor(Math.random() * players.length);
            set.push(players[index]);
            players.splice(index, 1);
        }

        return set;
    }

    updateVisiblePlayers() {
        for (let player of this.players) {
            player.socket.emit("player-visible-update", {
                data: {
                    game: this.getObject(),
                    playerId: player.id,
                    visiblePlayers: this.getSetVisiblePlayers(player.id),
                },
            });
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
        this.game = game;

        this.id = this.generateId();

        this.host = false;

        game.players.push(this);
        Player.players[this.id] = this;

        this.lives = game.rules.maxLives;
        this.acid = game.rules.maxAcid;

        this.hidden = false;

        this.score = 0;
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
            score: this.score,
            placement: this.placement,
        };
    }

    hit() {
        this.lives -= 1;
        if (this.lives <= 0) {
            this.hidden = true;

            this.game.updateVisiblePlayers();
        }

        this.updateAttributes();
    }

    updateAttributes() {
        this.socket.emit("player-update", {
            data: {
                game: this.game.getObject(),
                playerId: this.id,
                player: this.getObject(),
            },
        });
    }

    registerEvents() {
        this.socket.on("hide", (msg) => {
            this.hidden = true;
            this.game.updateVisiblePlayers();
        });

        this.socket.on("show", (msg) => {
            this.hidden = false;
            this.game.updateVisiblePlayers();
        });

        this.socket.on("attack", (msg) => {
            this.acid -= 1;

            if (msg.data.hit) {
                this.score += 1;

                let player = Player.getPlayer(msg.data.hit);
                // player.hit();
            }

            this.updateAttributes();
        });
    }
}

module.exports = {
    Game: Game,
    Player: Player,
};
