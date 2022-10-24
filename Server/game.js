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
            maxTime: 120,
            startDelay: 0,
        };
        this.state = {
            started: false,
            start_time: null,
            finished: false,
            winner: null,
        };
        this.players = [];
        this.visiblePlayersId = null;

        this.gameOverId = null;
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
            this.updateLeaderboard();

            this.gameOverId = setInterval(() => {
                this.updateGameOver();
            }, this.rules.maxTime * 1000);
        }, 1000 + this.rules.startDelay * 1000);
    }

    registerGameEvents() {
        for (let player of this.players) {
            player.registerEvents();
        }

        this.visiblePlayersId = setInterval(() => {
            this.updateVisiblePlayers();
        }, 5000);
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
            if (player.id != exclude && !player.hidden) {
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

        while (set.length < maxSetSize && players.length > 0) {
            let index = Math.floor(Math.random() * players.length);
            set.push(players[index]);
            players.splice(index, 1);
        }

        return set;
    }

    updateVisiblePlayers() {
        if (this.getAlivePlayers().length <= 1) {
            this.updateGameOver();
            clearInterval(this.visiblePlayersId);
            return;
        }

        for (let player of this.players) {
            player.socket.emit("player-visible-update", {
                data: {
                    game: this.getObject(),
                    playerId: player.id,
                    visiblePlayers: this.getSetVisiblePlayers(player.id),
                    playersAlive: this.getAlivePlayers().length,
                },
            });
        }
    }

    updateLeaderboard() {
        // Set placements for players
        let players = this.players;
        players.sort((a, b) => {
            return b.score - a.score;
        });

        for (let i = 0; i < players.length; i++) {
            players[i].placement = i + 1;
        }

        // List of upto top 5 players
        let leaderboard = [];

        for (let i = 0; i < 5 && i < players.length; i++) {
            leaderboard.push(players[i].getObject());
        }

        // Send leaderboard update
        this.sendUpdate("leaderboard-update", {
            data: {
                game: this.getObject(),
                leaderboard: leaderboard,
            },
        });
    }

    updateGameOver() {
        // Get Leaderboard
        let players = this.players;

        players.sort((a, b) => {
            return b.score - a.score;
        });

        // Create Object with playerIds and scores
        let placements = {};
        for (let i = 0; i < players.length; i++) {
            placements[players[i].id] = players[i].score;
        }

        // Send Game Over
        this.sendUpdate("game-over", {
            data: {
                game: this.getObject(),
                placements: placements,
            },
        });
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

        this.livesRegenId = null;
        this.acidRegenId = null;

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
            this.dead();
        }

        this.updateAttributes();
    }

    dead() {
        clearInterval(this.livesRegenId);
        clearInterval(this.acidRegenId);

        this.socket.emit("player-dead", {
            data: {
                game: this.game.getObject(),
                playerId: this.id,
            },
        });

        this.lives = 0;

        this.game.updateVisiblePlayers();
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

                console.log(msg.data.hit);

                let player = Player.getPlayer(msg.data.hit);
                player.hit();

                this.lives += 0.5;

                if (this.lives > this.game.rules.maxLives) {
                    this.lives = this.game.rules.maxLives;
                }

                this.game.updateLeaderboard();
            }

            this.updateAttributes();
        });

        // Set intervals for stuff

        this.acidRegenId = setInterval(() => {
            if (this.acid < this.game.rules.maxAcid) {
                if (this.hidden) {
                    this.acid += 0.05;
                } else {
                    this.acid += 0.25;
                }

                if (this.acid > this.game.rules.maxAcid) {
                    this.acid = this.game.rules.maxAcid;
                }

                this.updateAttributes();
            }
        }, 500);

        this.livesRegenId = setInterval(() => {
            if (this.lives < this.game.rules.maxLives) {
                if (this.hidden) {
                    this.lives += 0.01;
                } else {
                    this.lives += 0.025;
                }

                if (this.lives > this.game.rules.maxLives) {
                    this.lives = this.game.rules.maxLives;
                }

                this.updateAttributes();
            }
        }, 1000);
    }
}

module.exports = {
    Game: Game,
    Player: Player,
};
