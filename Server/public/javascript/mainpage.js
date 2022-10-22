const serverUrl = String(window.location);
var socket = io(serverUrl, {
    withCredentials: true,
});

// Variable Definitions

let myId = null;

// Listen for Events
socket.on("init", handleInit);

socket.on("success", (msg) => {
    console.log(msg);
});

socket.on("error", (msg) => {
    console.log(msg);
});

// Joining a Game

socket.on("lobby-joined", (msg) => {
    joinLobby(msg);
});

socket.on("name-updated", (msg) => {
    updateLobby(
        null,
        null,
        null,
        getPlayer(msg.data.game, msg.data.playerId).name
    );
});

socket.on("player-list-update", (msg) => {
    updateLobby(msg.data.game.players);
});

socket.on("host-update", (msg) => {
    document.querySelector(".show-on-host").classList.add("host");
});

socket.on("load-game", loadGame);

socket.on("start-countdown", (msg) => {
    timeTillStart = msg.data.game.rules.startDelay;
    i = setInterval(() => {
        if (timeTillStart >= 0) {
            updateGame({
                gameRules: msg.data.game.rules,
                timeLeft: timeTillStart,
            });
            timeTillStart--;
        }
    }, 1000);

    setTimeout(() => {
        clearInterval(i);
    }, timeTillStart * 1000 + 1000);
});

// Utility functions
function getPlayer(game, playerId) {
    for (let player of game.players) {
        if (player.id == playerId) {
            return player;
        }
    }
}

// Handle Init
function handleInit(msg) {}

// Join game Stuff

document.querySelector("#join-game").addEventListener("click", () => {
    const gameCode = document.querySelector("#game-code").value;
    socket.emit("join-game", {
        data: { gameCode: gameCode },
    });
});

document.querySelector("#create-game").addEventListener("click", () => {
    socket.emit("create-game", { data: "create-game" });
});

// Lobby Stuff

function joinLobby(msg) {
    myId = msg.data.playerId;

    document.querySelector(".wrapper").innerHTML = lobby;
    document.querySelector("#styling").href = "/css/lobby.css";

    document
        .querySelector("button#set-name")
        .addEventListener("click", setName.bind(msg));

    document
        .querySelector("button#change-name")
        .addEventListener("click", changeName.bind(msg));

    document.querySelector("#start-game").addEventListener("click", () => {
        if (
            msg.data.game.players.length > 1 &&
            getPlayer(msg.data.game, myId).host
        ) {
            socket.emit("start-game", {
                data: {
                    gameCode: msg.data.game.code,
                    playerId: myId,
                },
            });
        }
    });

    if (getPlayer(msg.data.game, myId).host) {
        document.querySelector(".show-on-host").classList.add("host");
    }

    document.querySelector("#start-game").addEventListener("click", () => {
        socket.emit("start-game", {
            data: {
                gameCode: msg.data.game.code,
                playerId: myId,
            },
        });
    });

    updateLobby(msg.data.game.players, msg.data.game.rules, msg.data.game.code);
}

function updateLobby(
    players = null,
    gameRules = null,
    gameCode = null,
    myName = null
) {
    if (players) {
        document.querySelector("#player-list").innerHTML = "";
        for (let player of players) {
            document.querySelector("#player-list").innerHTML += `
            <li class="list-group-item">${player.name}</li>
            `;
        }
    }

    if (gameRules) {
        document.querySelector("#game-rules").innerHTML = `
        <strong>Max Lives</strong> ${gameRules.maxLives}
        <strong>Max Acid</strong> ${gameRules.maxAcid}
        <strong>Time Limit</strong> ${gameRules.maxTime}
        `;
    }
    if (gameCode) {
        document.querySelector(
            "#game-code"
        ).innerHTML = `Game Code: ${gameCode}`;
    }
    if (myName) {
        document.querySelector(
            `#current-name`
        ).innerHTML = `<strong>Current Name:</strong> ${myName}`;
        document.querySelector(".set-name").classList.add("confirmed");
        document.querySelector(".change-name").classList.add("confirmed");
    }
}

// Lobby Functions
function setName(e) {
    selectedName = document.querySelector("input#set-name").value;
    socket.emit("set-name", {
        data: {
            name: selectedName,
            playerId: myId,
            gameCode: this.data.game.code,
        },
    });
}

function changeName(e) {
    selectedName = document.querySelector("input#change-name").value;
    socket.emit("set-name", {
        data: {
            name: selectedName,
            playerId: myId,
            gameCode: this.data.game.code,
        },
    });
}

// Game Stuff

function loadGame(msg) {
    console.log("test");

    document.querySelector(".wrapper").innerHTML = gameScreen;
    document.querySelector("#styling").href = "/css/game.css";

    updateGame({
        gameRules: msg.data.game.rules,
        timeLeft: msg.data.game.rules.startDelay,
        lives: getPlayer(msg.data.game, myId).lives,
        acid: getPlayer(msg.data.game, myId).acid,
        score: getPlayer(msg.data.game, myId).score,
        playersAlive: msg.data.game.players.length,
    });

    // Hide all moles
    for (let [position, mole] of Object.entries(Mole.molePositions)) {
        Mole.toggleMole(position, true);
    }
}

function updateGame(gameData) {
    /*
    gameData = {
        visiblePlayers: [
            {name: "example", acid: 3},
            ...
        ],
        playersAlive: 8,
        timeLeft: 30,
        score: 6,
        lives: 2.4,
        acid: 3.2,
        gameRules: {
            maxLives: 3,
            maxAcid: 5,
            maxTime: 180,
        }
    }
    */

    if (gameData.score) {
        document.querySelector("#score").innerHTML = gameData.score;
    }

    if (gameData.playersAlive) {
        document.querySelector("#players-left").innerHTML =
            gameData.playersAlive;
    }

    if (gameData.timeLeft) {
        document.querySelector("#time-left").innerHTML = `${Math.floor(
            gameData.timeLeft / 60
        )}:${("0" + Math.floor(gameData.timeLeft % 60)).slice(-2)}`;
    }

    if (gameData.lives) {
        document.querySelector("#health-amount").style.height = `
            ${(gameData.lives / gameData.gameRules.maxLives) * 100}%
        `;
    }

    if (gameData.acid) {
        document.querySelector("#acid-amount").style.height = `
            ${(gameData.acid / gameData.gameRules.maxAcid) * 100}%
        `;
    }
}

// Classes

class Mole {
    static molePositions = {
        "top-left": null,
        "top-right": null,
        "bottom-left": null,
        "bottom-right": null,
        middle: null,
    };

    constructor(playerId, game, position = null) {
        this.playerId = playerId;
        this.game = game;
        this.position = position;

        if (this.position) {
            Mole.molePositions[this.position] = this;
        }
    }

    static getMole(position) {
        return Mole.molePositions[position];
    }

    static toggleMole(position, hide = null) {
        let mole = document.querySelector(`.${position} .mole-entity`);

        if (hide == null) {
            mole.classList.toggle("hidden");

            if (mole.classList.contains("hidden")) {
                setTimeout(() => {
                    mole.classList.add("invisible");
                }, 200);
            } else {
                mole.classList.remove("invisible");
            }
        } else if (hide) {
            mole.classList.add("hidden");
            setTimeout(() => {
                mole.classList.add("invisible");
            }, 200);
        } else {
            mole.classList.remove("hidden");
            mole.classList.remove("invisible");
        }
    }

    setRandomPosition() {
        let positions = Object.keys(Mole.molePositions);
        let position = positions[Math.floor(Math.random() * positions.length)];

        while (Mole.molePositions[position]) {
            position = positions[Math.floor(Math.random() * positions.length)];
        }

        this.position = position;

        Mole.molePositions[position] = this;
    }

    removePosition() {
        Mole.molePositions[this.position] = null;
        this.position = null;
    }
}
