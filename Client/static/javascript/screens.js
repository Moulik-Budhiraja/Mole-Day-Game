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
                    <button id="start-game" class="start-game btn btn-success">
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
            </div>`;
