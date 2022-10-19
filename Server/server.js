// server-side
const io = require("socket.io")(3001, {
    cors: {
        origin: "http://localhost:5000",
        methods: ["GET", "POST"],
        credentials: true,
        allowEIO3: true,
        "Access-Control-Allow-Origin": "*",
    },
});

const { Game, Player } = require("./game.js");

io.on("connection", (client) => {
    client.emit("init", { data: null });
    console.log(`Client ${client.id} connected`);

    client.on("create-game", (msg) => {
        const game = new Game();
        const player = new Player("Player", client, game);
        player.host = true;
        client.emit("game-joined", {
            data: {
                game: game.getObject(),
                playerId: player.id,
            },
        });

        handleDisconnect(client, game, player);
    });

    client.on("join-game", (msg) => {
        const game = Game.getGame(msg.data.gameCode);
        if (game) {
            const player = new Player("Player", client, game);
            client.emit("game-joined", {
                data: {
                    game: game.getObject(),
                    playerId: player.id,
                },
            });

            game.sendUpdate("player-list-update", {
                data: {
                    game: game.getObject(),
                },
            });

            handleDisconnect(client, game, player);
        } else {
            client.emit("error", {
                data: {
                    message: "Game not found",
                },
            });
        }
    });

    client.on("set-name", (msg) => {
        const game = Game.getGame(msg.data.gameCode);
        const player = Player.getPlayer(msg.data.playerId);

        player.name = msg.data.name;
        client.emit("name-updated", {
            data: {
                game: game.getObject(),
                playerId: player.id,
            },
        });

        game.sendUpdate("player-list-update", {
            data: {
                game: game.getObject(),
            },
        });
    });

    client.on("start-game", (msg) => {
        const game = Game.getGame(msg.data.gameCode);
        const player = Player.getPlayer(msg.data.playerId);

        if (player.host) {
            game.start();
        }
    });
});

function handleDisconnect(client, game, player) {
    client.on("disconnect", () => {
        console.log(`Client ${client.id} disconnected`);
        game.players = game.players.filter((p) => p.id != player.id);
        Player.takenIds = Player.takenIds.filter((id) => id != player.id);
        delete Player.players[player.id];

        if (game.players.length == 0) {
            Game.takenCodes = Game.takenCodes.filter(
                (code) => code != game.code
            );

            delete Game.games[game.code];
        } else {
            if (player.host) {
                game.players[0].host = true;
                game.players[0].socket.emit("host-update", {
                    data: {
                        game: game.getObject(),
                        playerId: game.players[0].id,
                    },
                });
            }

            game.sendUpdate("player-list-update", {
                data: {
                    game: game.getObject(),
                },
            });
        }

        console.log(Game.games);
    });
}

io.listen(3000);
