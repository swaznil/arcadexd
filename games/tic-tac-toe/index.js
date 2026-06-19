var playerTurn, moves, isGameOver, span;

playerTurn = "x";
moves = 0;
isGameOver = false;

var gameMode = "local";

span = document.getElementsByTagName("span");
const restartButton = `<button onclick="playAgain()" aria-label="Restart Game">↻ Restart</button>`;

function play(y){
    if(y.dataset.player == "none" && window.isGameOver == false){
       y.innerHTML = playerTurn ;
       y.dataset.player = playerTurn;
       moves++;

    checkWinner(1,2,3);
    checkWinner(4,5,6);
    checkWinner(7,8,9);
    checkWinner(1,4,7);
    checkWinner(2,5,8);
    checkWinner(3,6,9);
    checkWinner(1,5,9);
    checkWinner(3,5,7);

    if(moves == 9 && isGameOver == false){
        draw();
        return;
    }

    if(playerTurn == "x"){
        playerTurn = "o";
    }else{
        playerTurn = "x";
    }
}

    if(gameMode === "bot" && playerTurn === "o" && !isGameOver){
        setTimeout(() => {
            botMove();
        }, 300);
    }
}

function checkWinner(a,b,c){
    a--;
    b--;
    c--;
    if((span[a].dataset.player === span[b].dataset.player) 
        && (span[b].dataset.player === span[c].dataset.player) 
        && (span[a].dataset.player != "none") && isGameOver == false){
            span[a].parentNode.className += " activeBox";
            span[b].parentNode.className += " activeBox";
            span[c].parentNode.className += " activeBox";
        gameOver(a);
        }
}

function playAgain(){
    var alertBox = document.getElementsByClassName("alert")[0];
    if(alertBox){
        alertBox.remove();
    }
    resetGame();
    window.isGameOver = false;
    moves = 0;
    for(var k = 0; k < span.length; k++){
        span[k].parentNode.classList.remove("activeBox");
    }
}

function resetGame(){
    for(var i = 0; i < span.length; i++){
        span[i].dataset.player = "none";
        span[i].innerHTML = "&nbsp;";
    }
    playerTurn = "x";
}

function gameOver(a){

    var gameOverAlertElement = `<div class="winnerText"> 🎉 PLAYER ${span[a].dataset.player.toUpperCase()} 
    WINS 🎉<br><br> ${restartButton}</div>`;
    var div = document.createElement("div");
    div.className = "alert";
    div.innerHTML = gameOverAlertElement;
    document.body.appendChild(div);
    window.isGameOver = true;
    moves = 0;
}

function draw(){
    var drawAlertElement = '<b> DRAW !!! </b><br>' + restartButton;
    var div = document.createElement("div");
    div.className = "alert";
    div.innerHTML = drawAlertElement;
    document.getElementsByTagName("body")[0].appendChild(div);
    window.isGameOver = true;
    moves = 0;
}

function setMode(mode){
    gameMode = mode;

    if(mode == "local"){
        document.getElementById("modeText").innerHTML = "Mode: vs Players 🧠";
    }

    else{
        document.getElementById("modeText").innerHTML = "Mode: vs Bot 🤖";
    }

    playAgain();
}

function botMove(){
    let empty = [];
    
    for(var i = 0; i < span.length; i++){
        if(span[i].dataset.player == "none"){
            empty.push(span[i]);
        }
    }

    if(empty.length == 0) return;

    let randomBox = empty[Math.floor(Math.random() * empty.length)]

    randomBox.innerHTML = "o";
    randomBox.dataset.player = "o";
    moves++;

    checkWinner(1,2,3);
    checkWinner(4,5,6);
    checkWinner(7,8,9);
    checkWinner(1,4,7);
    checkWinner(2,5,8);
    checkWinner(3,6,9);
    checkWinner(1,5,9);
    checkWinner(3,5,7);

    if(moves == 9 && !isGameOver){
        draw()
        return;
    }

    playerTurn = "x";
}

function goBack(){
    window.location.href = "../../index.html";
}