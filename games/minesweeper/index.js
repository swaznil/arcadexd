const grid = document.getElementById("grid");

const SIZE = 10;
const MINES = 20;

let gameOver = false;
let flagsUsed = 0;

generateGrid();

function generateGrid() {

    gameOver = false;

    flagsUsed = 0;
    updateHUD();

    setMessage("ACTIVE");

    grid.innerHTML = "";

    for (let row = 0; row < SIZE; row++) {

        const tr = grid.insertRow();

        for (let col = 0; col < SIZE; col++) {

            const cell = tr.insertCell();

            cell.dataset.mine = "false";
            cell.dataset.flagged = "false";

            cell.addEventListener("click", () => {

                if (gameOver) return;
                if (cell.dataset.flagged === "true") return;

                openCell(cell);
            });

            cell.addEventListener("contextmenu", (e) => {

                e.preventDefault();

                toggleFlag(cell);
            });

            let holdTimer;

            cell.addEventListener("touchstart", () => {

                if (gameOver) return;

                holdTimer = setTimeout(() => {

                    toggleFlag(cell);

                }, 450);
            });

            cell.addEventListener("touchend", () => {

                clearTimeout(holdTimer);
            });
        }
    }

    generateMines();
}

function generateMines() {

    let placed = 0;

    while (placed < MINES) {

        const row = Math.floor(Math.random() * SIZE);
        const col = Math.floor(Math.random() * SIZE);

        const cell = grid.rows[row].cells[col];

        if (cell.dataset.mine === "false") {

            cell.dataset.mine = "true";

            placed++;
        }
    }
}

function openCell(cell) {

    if (gameOver) return;
    if (cell.classList.contains("active")) return;
    if (cell.dataset.flagged === "true") return;

    cell.classList.add("active");

    if (cell.dataset.mine === "true") {

        revealMines();

        gameOver = true;

        setMessage("GAME OVER");

        return;
    }

    const row = cell.parentElement.rowIndex;
    const col = cell.cellIndex;

    const nearby = countNearbyMines(row, col);

    if (nearby > 0) {

        cell.textContent = nearby;
        cell.style.color = getNumberColor(nearby);
        cell.classList.add(`n${nearby}`);

    } else {

        for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, SIZE - 1); i++) {

            for (let j = Math.max(col - 1, 0); j <= Math.min(col + 1, SIZE - 1); j++) {

                const nextCell = grid.rows[i].cells[j];

                if (
                    !nextCell.classList.contains("active") &&
                    nextCell.dataset.flagged !== "true"
                ) {
                    openCell(nextCell);
                }
            }
        }
    }

    checkWin();
}

function toggleFlag(cell) {

    if (gameOver) return;
    if (cell.classList.contains("active")) return;

    if (cell.dataset.flagged === "true") {

        cell.dataset.flagged = "false";
        cell.textContent = "";
        flagsUsed--;

    } else {

        cell.dataset.flagged = "true";
        cell.textContent = "🚩";
        flagsUsed++;
    }

    updateHUD();
}

function updateHUD() {

    document.getElementById("status").textContent =
        `FLAGS: ${flagsUsed} / ${MINES}`;
}

function revealMines() {

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const cell = grid.rows[row].cells[col];

            if (cell.dataset.mine === "true") {

                cell.classList.add("mine");
                cell.textContent = "💣";
            }
        }
    }
}

function countNearbyMines(row, col) {

    let count = 0;

    for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, SIZE - 1); i++) {

        for (let j = Math.max(col - 1, 0); j <= Math.min(col + 1, SIZE - 1); j++) {

            if (grid.rows[i].cells[j].dataset.mine === "true") {
                count++;
            }
        }
    }

    return count;
}

function checkWin() {

    let opened = 0;

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const cell = grid.rows[row].cells[col];

            if (cell.classList.contains("active")) {
                opened++;
            }
        }
    }

    if (opened === (SIZE * SIZE) - MINES) {

        gameOver = true;

        revealMines();

        setMessage("YOU WIN");
    }
}

function getNumberColor(num) {

    const colors = {
        1: "#6ee7ff",
        2: "#7dff7a",
        3: "#ff7a7a",
        4: "#9ea7ff",
        5: "#ffb36b",
        6: "#6bffda",
        7: "#ff6bf2",
        8: "#dddddd"
    };

    return colors[num] || "#ffffff";
}

function setMessage(text) {

    document.getElementById("status").textContent = text;
}

function goBack() {

    window.location.href = "../../index.html";
}