document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector(".grid");
    const size = 4;
    let board = [];
    let prevBoard = [];
    let isGameOver = false;
    let currentScore = 0;
    const currentScoreElem = document.getElementById("current-score");
    let highScore = localStorage.getItem("2048-highScore") || 0;
    const highScoreElem = document.getElementById("high-score");
    highScoreElem.textContent = highScore;
    const gameOverElem = document.getElementById("game-over");


    function updateScore(value) {
        currentScore += value;
        currentScoreElem.textContent = currentScore;
        if (currentScore > highScore) {
            highScore = currentScore;
            highScoreElem.textContent = highScore;
            localStorage.setItem('2048-highScore', highScore);
        }
    }

    function restartGame() {
        currentScore = 0;
        currentScoreElem.textContent = '0';
        isGameOver = false;
        gameOverElem.style.display = 'none';
        initializeGame();
    }

    function initializeGame() {
        board = [...Array(size)].map(() => Array(size).fill(0));
        prevBoard = structuredClone(board);
        isGameOver = false;

        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            delete cell.dataset.value;
            cell.classList.remove('merged-tile', 'new-tile');
        });

        placeRandom();
        placeRandom();
        renderBoard();
    }

    function renderBoard() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {

            const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            const value = board[i][j];

            const prevValue = prevBoard[i][j];

            if (value !== 0) {
                cell.textContent = value;
                cell.dataset.value = value;

                if (prevValue !== value) {
                    cell.classList.add('new-tile');
                }
            } else {
                cell.textContent = '';
                delete cell.dataset.value;
                }
            }
        }

        prevBoard = structuredClone(board);

        setTimeout(() => {
            document.querySelectorAll('.cell').forEach(cell => {
                cell.classList.remove('merged-tile', 'new-tile');
            });
        }, 200);
    }


    function placeRandom() {
        const available = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) {
                    available.push({ x: i, y: j });
                }
            }
        }

        if (available.length > 0) {
            const randomCell = available[Math.floor(Math.random() * available.length)];
            board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            const cell = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);
            cell.classList.add('new-tile'); // Animation for new tiles
        }
    }


    function move(direction){

        if (isGameOver) return;

        let hasChanged = false;
        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let j = 0; j < size; j++) {
                const column = [...Array(size)].map((_, i) => board[i][j]);
                const newColumn = transform(column, direction === 'ArrowUp');
                for (let i = 0; i < size; i++) {
                    if (board[i][j] !== newColumn[i]) {
                        hasChanged = true;
                        board[i][j] = newColumn[i];
                    }
                }
            }
        } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let i = 0; i < size; i++) {
                const row = board[i];
                const newRow = transform(row, direction === 'ArrowLeft');
                if (row.join(',') !== newRow.join(',')) {
                    hasChanged = true;
                    board[i] = newRow;
                }
            }
        }
        if(hasChanged){
            placeRandom();
            renderBoard();
            window.dispatchEvent(new CustomEvent("2048-move"));
            checkGameOver();
        }
    }


    function transform(line, moveTowardsStart){
        let newLine = line.filter(cell => cell !== 0);
        if(!moveTowardsStart){
            newLine.reverse();
        }
        
        for (let i = 0; i < newLine.length -1; i++){
            if (newLine[i] === newLine[i+1]){
                newLine[i] *= 2;
                updateScore(newLine[i]);
                window.dispatchEvent(new CustomEvent("2048-merge", {detail: {value: newLine[i]}}));
                newLine.splice(i + 1, 1);
                i++;
            }
        }
        while (newLine.length < size) {
            newLine.push(0);
        }
        if (!moveTowardsStart) {
            newLine.reverse();
        }
        return newLine;
    }

    function checkGameOver() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === 0) {
                    return; // empty cell, game not over
                }
                if (j < size - 1 && board[i][j] === board[i][j + 1]) {
                    return; // horizontally adjacent equal cells, move is possible
                }
                if (i < size - 1 && board[i][j] === board[i + 1][j]) {
                    return; // vertically adjacent equal cells, move is possible
                }
            }
        }

        // no moves are possible
        isGameOver = true;
        gameOverElem.style.display = 'flex';
    }


    document.addEventListener('keydown', event => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            move(event.key);
        }
    });

    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const SWIPE_THRESHOLD = 40;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > SWIPE_THRESHOLD) {
                move('ArrowRight');
            } else if (dx < -SWIPE_THRESHOLD) {
                move('ArrowLeft');
            }
        } else {
            if (dy > SWIPE_THRESHOLD) {
                move('ArrowDown');
            } else if (dy < -SWIPE_THRESHOLD) {
                move('ArrowUp');
            }
        }
    });


    let mouseStartX = 0;
    let mouseStartY = 0;
    let isDragging = false;

    document.addEventListener('mousedown', e => {
        isDragging = true;
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
    });

    document.addEventListener('mouseup', e => {
        if (!isDragging) return;

        const dx = e.clientX - mouseStartX;
        const dy = e.clientY - mouseStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 40) {
                move('ArrowRight');
            } else if (dx < -40) {
                move('ArrowLeft');
            }
        } else {
            if (dy > 40) {
                move('ArrowDown');
            } else if (dy < -40) {
                move('ArrowUp');
            }
        }

        isDragging = false;
    });


    document.getElementById('restart-btn').addEventListener('click', restartGame);

    initializeGame();

});

function goBack(){
    window.location.href = "/index.html"; 
}