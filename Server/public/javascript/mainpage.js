const serverUrl = String(window.location);
var socket = io(serverUrl, {
    withCredentials: true,
});

// Variable Definitions

let myId = null;
let myMole = null;

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
        if (timeTillStart > 0) {
            updateGame({
                gameRules: msg.data.game.rules,
                timeLeft: timeTillStart--,
            });
        } else {
            clearInterval(i);
        }
    }, 1000);
});

socket.on("game-started", (msg) => {
    startGame(msg);
});

socket.on("player-visible-update", (msg) => {
    for (let player of msg.data.visiblePlayers) {
        if (!Mole.moles.some((mole) => mole.id == player.id)) {
            let mole = new Mole(player.id, msg.data.game);
            mole.startMoving(750);
            console.log("Started Moving");
        }
    }

    for (let mole of Mole.moles) {
        if (
            !msg.data.visiblePlayers.some(
                (player) => player.id == mole.playerId
            )
        ) {
            mole.remove();
        }
    }
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

    document.querySelectorAll(".game-container img").forEach((img) => {
        img.setAttribute("draggable", false);
    });

    // Hide Moles
    for (let [position, mole] of Object.entries(Mole.molePositions)) {
        Mole.toggleMole(position, true);
    }
}

function updateGame(gameData) {
    /*
    gameData = {
        visiblePlayers: [
            {name: "example", position: "top-left"},
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
        if (gameData.timeLeft === 0) {
            document.querySelector("#time-left").innerHTML = "0:00";
        } else {
            document.querySelector("#time-left").innerHTML = `${Math.floor(
                gameData.timeLeft / 60
            )}:${("0" + Math.floor(gameData.timeLeft % 60)).slice(-2)}`;
        }
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

function startGame(msg) {
    console.log("game Started");

    // Set timer to start timeLeft
    let timeLeft = msg.data.game.rules.maxTime;
    setInterval(() => {
        updateGame({
            gameRules: msg.data.game.rules,
            timeLeft: timeLeft--,
        });
    }, 1000);

    myMole = new PersonalMole(myId, msg.data.game, socket);

    document.addEventListener("keydown", (e) => {
        if (e.key === " ") {
            myMole.toggle();
        }
    });

    document.addEventListener("click", (e) => {
        if (myMole.hidden) {
            return;
        }

        if (e.target.classList.contains("game-mole")) {
            molePosition = e.target.parentElement.parentElement.classList[0];

            myMole.attack(molePosition);

            // Flash mole red

            e.target.style.filter = "brightness(0.6)";

            setTimeout(() => {
                e.target.style.filter = "brightness(1)";
            }, 100);
        } else {
            myMole.attack();
        }

        let gameContainer = document.querySelector(".game-container");
        let gameContainerRect = gameContainer.getBoundingClientRect();
        // Place acid pool on click location
        let acid = document.createElement("img");
        acid.classList.add("acid");

        acid.setAttribute("src", "/media/game-acid-pool.svg");

        // Apply random rotation
        acid.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;

        let acidWrapper = document.createElement("span");
        acidWrapper.classList.add("acid-wrapper");
        acidWrapper.style.top = `${e.clientY - gameContainerRect.top}px`;
        acidWrapper.style.left = `${e.clientX - gameContainerRect.left}px`;

        acidWrapper.appendChild(acid);
        gameContainer.appendChild(acidWrapper);

        setTimeout(() => {
            acidWrapper.classList.add("fade-acid");
        }, 200);

        setTimeout(() => {
            acidWrapper.remove();
        }, 2000);
    });
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
    static moles = [];

    constructor(playerId, game, position = null) {
        this.playerId = playerId;
        this.game = game;
        this.position = position;

        this.name = getPlayer(game, playerId).name;
        console.log(this.name);

        this.moveId = null;

        if (this.position) {
            Mole.molePositions[this.position] = this;
        }

        Mole.moles.push(this);
    }

    static getMole(position) {
        return Mole.molePositions[position];
    }

    static toggleMole(position, hide = null, name = "") {
        let mole = document.querySelector(`.${position} .mole-entity`);

        if (!position) {
            return;
        }

        // console.log(position);

        document.querySelector(
            `.${position} .mole-entity .mole-name`
        ).innerHTML = name;

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
        if (this.position) {
            Mole.toggleMole(this.position, true, this.name);
        }

        this.removePosition();

        let positions = Object.keys(Mole.molePositions);
        let position = positions[Math.floor(Math.random() * positions.length)];

        while (Mole.molePositions[position]) {
            position = positions[Math.floor(Math.random() * positions.length)];
        }

        this.position = position;

        Mole.molePositions[position] = this;

        setTimeout(() => {
            Mole.toggleMole(position, false, this.name);
        }, 200);
    }

    removePosition() {
        if (this.position) {
            Mole.molePositions[this.position] = null;
            this.position = null;
        }
    }

    startMoving(delay) {
        this.moveId = setInterval(() => {
            this.setRandomPosition();
        }, delay);
    }

    stopMoving() {
        clearInterval(this.moveId);
    }

    remove() {
        this.stopMoving();
        this.removePosition();
        Mole.moles = Mole.moles.filter((mole) => mole !== this);
    }
}

class PersonalMole {
    constructor(playerId, game, socket) {
        this.playerId = playerId;
        this.game = game;
        this.socket = socket;

        this.mole = document.querySelector(".personal-mole-entity");

        this.hidden = getPlayer(game, playerId).hidden;
    }

    hide() {
        this.hidden = true;

        this.socket.emit("hide", {
            data: {
                playerId: this.playerId,
                gameCode: this.game.code,
            },
        });

        this.mole.classList.add("hidden");
    }

    show() {
        this.hidden = false;

        this.socket.emit("show", {
            data: {
                playerId: this.playerId,
                gameCode: this.game.code,
            },
        });
        this.mole.classList.remove("hidden");
    }

    toggle() {
        if (this.hidden) {
            this.show();
        } else {
            this.hide();
        }
    }

    attack(hit = null) {
        this.socket.emit("attack", {
            data: {
                playerId: this.playerId,
                gameCode: this.game.code,
                hit: hit,
            },
        });
    }
}
