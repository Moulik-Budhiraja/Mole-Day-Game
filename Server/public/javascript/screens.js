const lobby = /* html */ `
<h1 class="title">Game Lobby</h1>
    <div class="dashboard">
        <div class="player-list">
            <h3>Players</h3>
            <ul class="list-group" id="player-list">
            </ul>
        </div>
        <div class="game-info">
            <h3 id="game-code">Game code: </h3>
            <p id="game-rules" class="game-settings">
                <strong>Max Lives:</strong>
                <strong>Max Acid:</strong>
                <strong>Time Limit:</strong>
            </p>
            <button id="start-game" class="start-game btn btn-success show-on-host">
                Start Game
            </button>
        </div>

        <div class="name-settings">
            <div class="set-name">
                <h3>Set your name</h3>
                <input
                    type="text"
                    id="set-name"
                    class="form-control username"
                    placeholder="Enter Name"
                    aria-label="Input group example"
                    aria-describedby="btnGroupAddon"
                    placeholder="Code"
                />
                <button class="btn btn-primary" id="set-name">
                    Confirm
                </button>
            </div>
            <div class="change-name">
                <h3>Change your name</h3>
                <h6 id="current-name"><strong>Current Name:</strong> </h6>
                <input
                    type="text"
                    id="change-name"
                    class="form-control username"
                    placeholder="Enter Name"
                    aria-label="Input group example"
                    aria-describedby="btnGroupAddon"
                    placeholder="Code"
                />
                <button class="btn btn-primary" id="change-name">
                    Update
                </button>
            </div>
        </div>
    </div>
`;

const gameScreen = /* html */ `
<div class="game-container">
    <div class="background">
        <img src="/media/game-sky.svg" class="game-sky" />
        <img src="/media/game-ground.svg" class="game-ground" />
        <img
            src="/media/game-burrow-backs.svg"
            class="game-burrow-backs"
        />
    </div>
    <div class="moles">
        <div class="top-left mole-container">
            <div class="mole-entity">
                <h6 class="mole-name">Testing</h6>
                <img src="/media/game-mole.svg" class="game-mole" />
            </div>
            <img
                src="/media/game-ground-top-left.svg"
                class="game-ground-cover"
            />
        </div>
        <div class="top-right mole-container">
            <div class="mole-entity">
                <h6 class="mole-name">Another Name</h6>
                <img src="/media/game-mole.svg" class="game-mole" />
            </div>
            <img
                src="/media/game-ground-top-right.svg"
                class="game-ground-cover"
            />
        </div>
        <div class="bottom-left mole-container">
            <div class="mole-entity">
                <h6 class="mole-name">Bottom Left</h6>
                <img src="/media/game-mole.svg" class="game-mole" />
            </div>
            <img
                src="/media/game-ground-bottom-left.svg"
                class="game-ground-cover"
            />
        </div>
        <div class="middle mole-container">
            <div class="mole-entity">
                <h6 class="mole-name">Middle Man</h6>
                <img src="/media/game-mole.svg" class="game-mole" />
            </div>
            <img
                src="/media/game-ground-middle.svg"
                class="game-ground-cover"
            />
        </div>
        <div class="bottom-right mole-container">
            <div class="mole-entity">
                <h6 class="mole-name">Bottom Right</h6>
                <img src="/media/game-mole.svg" class="game-mole" />
            </div>
            <img
                src="/media/game-ground-middle.svg"
                class="game-ground-cover"
            />
        </div>
    </div>
    <div class="foreground">
        <img
            src="/media/game-burrow-fronts.svg"
            class="game-burrow-fronts"
        />
    </div>
</div>
<div class="hud">
    <div class="left">
        <div class="timer">
            <img src="/media/game-clock.svg" class="icon" />
            <h1 id="time-left">2:56</h1>
        </div>
        <div class="health-wrapper">
            <div class="health">
                <div id="health-amount" class="progress"></div>
            </div>
            <img src="/media/game-heart.svg" class="icon" />
        </div>
        <div class="mole-position">
            <img
                src="/media/game-personal-burrow-back.svg"
                class="background"
            />
            <div class="personal-mole-entity">
                <h6>My Name</h6>
                <img
                    src="/media/game-mole.svg"
                    class="personal-mole"
                />
            </div>

            <div class="mole-cover"></div>
            <img
                src="/media/game-personal-burrow-front.svg"
                class="foreground"
            />
        </div>
    </div>
    <div class="right">
        <div class="players-left">
            <img src="/media/game-players.svg" class="icon" />
            <h1 id="players-left">3</h1>
        </div>
        <div class="score">
            <img src="/media/game-target.svg" class="icon" />
            <h1 id="score">0</h1>
        </div>
        <div class="ammo-wrapper">
            <div class="ammo">
                <div class="progress" id="acid-amount"></div>
                
            </div>
            <img src="/media/game-potion.svg" class="icon" />
        </div>
    </div>
</div>
`;
