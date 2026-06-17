const grid = document.getElementById("grid");
let lockGame = false;
let testMode = false;

const SIZE = 10;
const MINES = 20;

generateGrid();

function generateGrid(){
    lockGame = false;
    setMessage("");
    grid.innerHTML = "";

        for(let row = 0; row < SIZE; row++){
            const tr = grid.insertRow();

            for(let col = 0; col < SIZE; col++){
                const cell = tr.insertCell();
                cell.dataset.mine = "false"
                
                cell.addEventListener("click", () => {
                   openCell(cell);
                });
            }
        }
    generateMines();
}

function generateMines(){
    let minesPlaced = 0;

    while(minesPlaced < MINES){
        let row = Math.floor(Math.random() * SIZE);
        let col = Math.floor(Math.random() * SIZE);
        let cell = grid.rows[row].cells[col];

        if (cell.dataset.mine === "false") {
            cell.dataset.mine = "true";
            minesPlaced++;

            if(testMode){
                cell.innerHTML = "💣";
            }
        }
    }
}

function revealMines(){
    for(let row = 0; row < SIZE; row++){
        for(let col = 0; col < SIZE; col++){
            let cell = grid.rows[row].cells[col];
            if (cell.dataset.mine === "true"){
                cell.classList.add("mine");
                cell.textContent = "💣";
            }
        }
    }
}

function countNearbyMines(row, col) {
    let count = 0;

    for (let pos = Math.max(row - 1, 0); pos <= Math.min(row + 1, SIZE - 1); pos++) {
        for (let jdx = Math.max(col - 1, 0); jdx <= Math.min(col + 1, SIZE - 1); jdx++) {
            if (grid.rows[pos].cells[jdx].dataset.mine === "true") {
                count++;
            }
        }
    }

    return count;
}

function openCell(cell){

    if (lockGame) return;

    if (cell.classList.contains("active")) return;

    cell.classList.add("active");

    if (cell.dataset.mine === "true"){
        revealMines();
        lockGame = true;
        setMessage("Game Over");
        return;
    } 

    const row = cell.parentNode.rowIndex;
    const col = cell.cellIndex;

    const nearby = countNearbyMines(row, col);
        
    if (nearby > 0) {
        cell.textContent = nearby;
    } 
    else {
            for (let i = Math.max(row - 1, 0); i <= Math.min(row +1, SIZE, 9); i++){
                for ( let j = Math.max(col -1, 0); j <= Math.min(col +1, SIZE, 9); j++){
                    
                    const nextCell = grid.rows[i].cells[j]
                    
                    if (!nextCell.classList.contains("active")){
                        openCell(nextCell)
                    }  
                }
            }
        }
    checkGameCompletion();
}

function checkGameCompletion() {
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
        lockGame = true;
        revealMines();

        setMessage("You Win!");
    }
}

function setMessage(text) {
    document.getElementById("status").textContent = text;
}

function goBack() {
    window.location.href = "../../index.html";
}