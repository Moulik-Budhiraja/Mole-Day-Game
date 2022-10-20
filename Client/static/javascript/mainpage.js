const serverUrl = "http://localhost:3000";
var socket = io(serverUrl);

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

socket.on("game-joined", (msg) => {
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

// Handle Connection to Server

function handleInit(msg) {
    console.log(msg);
}

// Utility functions
function getPlayer(game, playerId) {
    for (let player of game.players) {
        if (player.id == playerId) {
            return player;
        }
    }
}

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

function joinLobby(msg) {
    myId = msg.data.playerId;
    document.querySelector(".wrapper").innerHTML = lobby;
    document.querySelector("#styling").href =
        "http://localhost:5000/static/css/lobby.css";

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

function toggleMole(position) {
    let mole = document.querySelector(`.${position} .mole-entity`);

    mole.classList.toggle("hidden");

    if (mole.classList.contains("hidden")) {
        setTimeout(() => {
            mole.classList.add("invisible");
        }, 200);
    } else {
        mole.classList.remove("invisible");
    }
}
