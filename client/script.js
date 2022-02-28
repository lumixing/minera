console.log("ready!");

const colors = {
    "one": "#3498db",
    "two": "#2ecc71",
    "three": "#e74c3c",
    "four": "#f1c40f",
    "five": "#e67e22",
    "six": "#16a085",
    "seven": "#9b59b6",
    "eight": "#95a5a6",
    "zero": "#363636",
    "bomb": "hsl(0, 78%, 40%)"
}
const theme = {
    cell: {
        "background-color": "dodgerblue",
        "color": "#eee",
        "width": "48px",
        "height": "48px",
        "outline": "none",
        "border": "none",
        "border-radius": "8px",
        "font-size": "24px",
        "transition": "0.05s",
        "font-weight": "bold",
        "display": "flex",
        "justify-content": "center",
        "align-items": "center"
    },
    c1: {
        "color": `${colors.one}`,
        "border": `${colors.one} solid 4px`
    },
    c2: {
        "color": `${colors.two}`,
        "border": `${colors.two} solid 4px`
    },
    c3: {
        "color": `${colors.three}`,
        "border": `${colors.three} solid 4px`
    },
    c4: {
        "color": `${colors.four}`,
        "border": `${colors.four} solid 4px`
    },
    c5: {
        "color": `${colors.five}`,
        "border": `${colors.five} solid 4px`
    },
    c6: {
        "color": `${colors.six}`,
        "border": `${colors.six} solid 4px`
    },
    c7: {
        "color": `${colors.seven}`,
        "border": `${colors.seven} solid 4px`
    },
    c8: {
        "color": `${colors.eight}`,
        "border": `${colors.one} solid 4px`
    },
    c0: {
        "background-color": "#363636"
    },
};

let width = parseInt($("#width").val());
let height = parseInt($("#height").val());
let mines = parseInt($("#mines").val());
let board = [];
let minesArray = [];
let flagsArray = [];
let clicks = 0;

$("#settings-container").hide();
$("#game-container").hide();

$("#play").click(() => {
    width = parseInt($("#width").val());
    height = parseInt($("#height").val());
    mines = parseInt($("#mines").val());

    $("#board").css("grid-template-columns", `repeat(${height}, 48px)`);
    $("#board").css("grid-template-rows", `repeat(${width}, 48px)`);

    init();
    renderBoard();

    $(".modal").hide();

    $("#menu-container").hide();
    $("#game-container").show();
});

$("#settings").click(() => {
    $("#menu-container").hide();
    $("#settings-container").show();
});

$("#back").click(() => {
    $("#settings-container").hide();
    $("#menu-container").show();
});

$("#close").click(() => {
    $(".modal").hide();
});

// general initialization
function init() {
    initGameBoard();
    initBoard();
    placeMines(mines);
    updateNumbers();
}

// initialize DOM board by appending cells to the game board
function initGameBoard() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            // const cell = $(`<button id="x${x}y${y}" class="cell"></button>`);
            const cell = $(`<button id="x${x}y${y}" class="clickableCell"></button>`);

            cell.css(theme.cell);

            cell.data("x", x);
            cell.data("y", y);

            $("#board").append(cell);
        }
    }
}

// initialize local board by setting it to a 2d array filled with empty cells
function initBoard() {
    // not using Array.fill because it uses value referencing
    // note that this code switches up width and height because x in this system correlates to an array (row) and y to the index of that array (column)
    board = Array.from({ length: width }, e => Array.from({ length: height }, e => {
        return {
            value: 0,
            revealed: false,
            flagged: false
        }
    }));
}

// randomly place mines around the board
function placeMines(minesNum) {
    for (let i = 0; i < minesNum; i++) {
        const [x, y] = [randomInteger(0, width), randomInteger(0, height)];

        // if cell is already a mine, go back
        if (getCell(x, y).value === -1) {
            i--;
            continue;
        }

        getCell(x, y).value = -1;
        minesArray.push([x, y]);
    }
}

// update numbers near the previously placed mines
function updateNumbers() {
    minesArray.forEach((m) => {
        const neighbours = getNeighbours(m[0], m[1]);

        neighbours.forEach((n) => {
            // if cell exists and is not a mine, increment its value
            if (n && getCell(n[0], n[1]).value !== -1) {
                getCell(n[0], n[1]).value++;
            }
        });
    });
}

// used to reactive flags
// function updateNumbersNear(x, y, cell, decrease) {
//     const neighbours = getCellNeighbours(x, y);

//     neighbours.forEach((n) => {
//         if (n && getCellAt(n[0], n[1]).value !== -1) {
//             // decrease ? getCellAt(n[0], n[1]).value-- : getCellAt(n[0], n[1]).value++;
//             if (decrease && getCellAt(n[0], n[1]).value !== 0) getCellAt(n[0], n[1]).value--;
//             else getCellAt(n[0], n[1]).value++;
//         }
//     });
// }

// if exists, gets cell from x, y coordinate
function getCell(x, y) {
    if (!isValidCell(x, y)) throw new Error(`Trying to get invalid cell at (${x}, ${y})`);
    return board[x][y];
}

// unused (only used in mfbot)
// function setCellAt(x, y, key, value) {
//     if (isValidCell(x, y)) {
//         board[x][y][key] = value;
//     }
// }

// returns true if coordinates are inside of the board
function isValidCell(x, y) {
    return !(x < 0 || x >= width || y < 0 || y >= height);
}

// returns array of coordinates of surrouding cells
function getNeighbours(x, y) {
    const neighbourCoords = [[-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]];

    return neighbourCoords.map((c) => {
        if (isValidCell(x + c[0], y + c[1])) {
            return [x + c[0], y + c[1]];
        }

        // if cell doesnt exist in board, return false
        return false;
    });
}

// updates DOM cells
function renderBoard(listenInput = true) {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const cell = getCell(x, y);
            const element = $(`#x${x}y${y}`);

            if (cell.revealed) {
                if (cell.value === -1) element.text("💣");
                else {
                    element.removeAttr("style");
                    // element.addClass(`cell c${cell.value} c0`);
                    element.css(theme.cell);
                    element.css(theme[`c${cell.value}`]);
                    element.css(theme.c0);

                    if (cell.value !== 0) element.text(cell.value);
                    else element.text("");
                }
            }
            else {
                if (cell.flagged) element.text("🚩");
                else element.text("");
            }
        }
    }

    // after updating all cells, listen for user click
    if (listenInput) listenForClick();
}

// listens for user click and decides action afterwards
function listenForClick() {
    console.log("listening for click...");

    $("#board").one("mouseup", ".clickableCell", (e) => {
        if (e.which == 1) {
            handleLeftClick(e);
        }
        else if (e.which == 3) {
            handleRightClick(e);
        }

        else if (e.which == 2) {
            handleMiddleClick(e);
        }
    });
}

function handleLeftClick(e) {
    const x = parseInt($(e.target).data("x"));
    const y = parseInt($(e.target).data("y"));

    const cell = getCell(x, y);

    // if trying to reveal already revealed or flagged cell, dont do anything
    if (cell.revealed || cell.flagged) {
        return listenForClick();
    }

    cell.revealed = true;
    clicks++;

    // if revealed a mine
    if (cell.value === -1) {
        // prevent first click mine
        if (clicks === 1) {
            console.log("first click mine! slightly changing board! :)");

            cell.value = 0;
            minesArray = minesArray.filter((m) => m[0] != x || m[1] != y)

            // resetting numbers
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    if (getCell(x, y).value !== -1) getCell(x, y).value = 0;
                }
            }

            placeMines(1);
            updateNumbers();

            renderBoard();
            return;
        }

        showModal("you stepped on a mine!");
        renderBoard(false);
        return;
    }

    // if revealed a 0, make chain reaction by searching all of the cells near it again and again
    if (cell.value === 0) {
        repeatRevealing(x, y);
    }

    if (hasWon()) {
        showModal("you won!")
        renderBoard(false);
        return;
    }

    renderBoard();
}

// repeat on revealing cells until there are no other 0 value cells
function repeatRevealing(x, y) {
    const locationsToUncover = [];
    locationsToUncover.push({ x, y });
    const neighbourCoords = [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }];

    while (locationsToUncover.length > 0) {
        for (var i = 0; i < neighbourCoords.length; i++) {
            let newCoord = { x: locationsToUncover[0].x + neighbourCoords[i].x, y: locationsToUncover[0].y + neighbourCoords[i].y };
            if (!isValidCell(newCoord.x, newCoord.y) || getCell(newCoord.x, newCoord.y).revealed) continue;
            getCell(newCoord.x, newCoord.y).revealed = true;

            // continue revealing
            if (getCell(newCoord.x, newCoord.y).value === 0) {
                locationsToUncover.push(newCoord);
            }
        }

        locationsToUncover.shift();
    }
}

function hasWon() {
    console.log(board.flat().filter((c) => !c.revealed).length === mines);
    return board.flat().filter((c) => !c.revealed).length === mines;
}

function handleRightClick(e) {
    const x = parseInt($(e.target).data("x"));
    const y = parseInt($(e.target).data("y"));

    const cell = getCell(x, y);

    // if trying to flag revealed cell, dont do anything
    if (cell.revealed) {
        return listenForClick();
    }

    // reactive flags code
    // if (cell.flagged) updateNumbersNear(x, y, cell, false);
    // else updateNumbersNear(x, y, cell, true);

    // if (cell.flagged) flagsArray = flagsArray.filter((f) => f[0] != x || f[1] != y);

    // toggle between flagged and unflagged
    cell.flagged = !cell.flagged;

    renderBoard();
}

function handleMiddleClick(e) {
    const x = parseInt($(e.target).data("x"));
    const y = parseInt($(e.target).data("y"));

    const cell = getCell(x, y);

    if (cell.revealed) {
        chordCell(x, y, cell);
    }

    if (hasWon()) {
        showModal("you won!")
        renderBoard(false);
        return;
    }

    renderBoard();
}

function chordCell(x, y, cell) {
    console.log("attempting chording...");
    const neighbours = getNeighbours(x, y);

    // if cell value is equal to neighbour flag amount
    if (cell.value === neighbours.filter((c) => c ? getCell(c[0], c[1]).flagged : "").length) {
        console.log("chording...");

        for (let i = 0; i < neighbours.length; i++) {
            const c = neighbours[i];
            if (!c) continue;

            const neighbour = getCell(c[0], c[1]);

            if (!neighbour.revealed && !neighbour.flagged) {
                neighbour.revealed = true;

                if (neighbour.value === -1) {
                    showModal("you chorded a mine!");
                }

                if (neighbour.value === 0) {
                    repeatRevealing(c[0], c[1]);
                }
            }
        }
    }

    else console.log("couldnt chord due to flag requirements!");
}

function showModal(message) {
    if (message) $("#modal-message").text(message);
    $(".modal").show();
}

// console method
function revealAllCells() {
    if (!board[0]) throw new Error("Game is not currently running");

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const cell = getCell(x, y);
            cell.revealed = true;
        }
    }

    renderBoard();
    return "Revealed board";
}

function randomInteger(min, max) {
    return ~~(Math.random() * (max - min) + min);
}
