const game = document.getElementById("game");
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const comboText = document.getElementById("combo");

let W = 0, H = 0;

const STATE = { READY: 0, PLAYING: 1, DEAD: 2, OVER: 3 };
let state = STATE.READY;

let score = 0;
let lives = 3;
let combo = 1;

const BALL_SIZE = 14;

let paddle = { x: 0, y: 0, w: 140, h: 16, vx: 0 };
let ball = { x: 0, y: 0, vx: 0, vy: 0 };

const keys = { left: false, right: false };

const ROWS = 4, COLS = 9, GAP = 12, TOP = 50;
let bricks = [];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function hud() {
    scoreText.textContent = score;
    livesText.textContent = lives;
    comboText.textContent = "x" + combo;
}

function createScene() {
    game.innerHTML = "";

    const p = document.createElement("div");
    p.id = "paddle";

    const b = document.createElement("div");
    b.id = "ball";

    game.appendChild(p);
    game.appendChild(b);
}

function overlay(text) {
    game.querySelector(".overlay")?.remove();
    const el = document.createElement("div");
    el.className = "overlay";
    el.innerHTML = `<div class="popup"><h2>${text}</h2></div>`;
    game.appendChild(el);
}

function clearOverlay() {
    game.querySelector(".overlay")?.remove();
}

function resetBall(stick = true) {
    ball.x = W / 2;
    ball.y = H * 0.72;
    ball.vx = 0;
    ball.vy = 0;
    state = stick ? STATE.READY : STATE.PLAYING;
    overlay("CLICK / TAP TO LAUNCH");
}

function launch() {
    if (state !== STATE.READY) return;
    clearOverlay();
    const dir = Math.random() > 0.5 ? 1 : -1;
    ball.vx = dir * 4.5;
    ball.vy = -5.2;
    state = STATE.PLAYING;
}

function createBricks() {
    game.querySelectorAll(".brick").forEach(b => b.remove());
    bricks = [];

    const bw = (W - GAP * (COLS + 1)) / COLS;
    const bh = 26;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {

            const el = document.createElement("div");
            el.className = "brick";

            const x = GAP + c * (bw + GAP);
            const y = TOP + r * (bh + GAP);

            el.style.left = x + "px";
            el.style.top = y + "px";
            el.style.width = bw + "px";
            el.style.height = bh + "px";

            game.appendChild(el);

            bricks.push({ x, y, w: bw, h: bh, el, alive: true });
        }
    }
}

function updatePaddle() {

    if (keys.left) paddle.vx -= 1.2;
    if (keys.right) paddle.vx += 1.2;

    paddle.vx *= 0.82;
    paddle.x += paddle.vx;

    paddle.x = clamp(paddle.x, 0, W - paddle.w);
    paddle.y = H - 40;

    const el = document.getElementById("paddle");
    el.style.left = paddle.x + "px";
    el.style.top = paddle.y + "px";
    el.style.width = paddle.w + "px";
}

function updateBall() {

    if (state === STATE.READY) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - BALL_SIZE;
        render();
        return;
    }

    if (state !== STATE.PLAYING) return;

    const px = ball.x, py = ball.y;

    ball.x += ball.vx;
    ball.y += ball.vy;

    const cx = ball.x;
    const cy = ball.y;

    if (cx < BALL_SIZE / 2 || cx > W - BALL_SIZE / 2) ball.vx *= -1;
    if (cy < BALL_SIZE / 2) ball.vy *= -1;

    if (
        cx > paddle.x &&
        cx < paddle.x + paddle.w &&
        cy + BALL_SIZE / 2 > paddle.y &&
        cy < paddle.y + paddle.h &&
        ball.vy > 0
    ) {
        const hit = (cx - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vx = hit * 5.5;
        ball.vy = -Math.abs(ball.vy);
        combo = 1;
    }

    for (const b of bricks) {
        if (!b.alive) continue;

        if (
            cx > b.x &&
            cx < b.x + b.w &&
            cy > b.y &&
            cy < b.y + b.h
        ) {
            b.alive = false;
            b.el.classList.add("hit");

            setTimeout(() => b.el.remove(), 120);

            if (px < b.x || px > b.x + b.w) ball.vx *= -1;
            else ball.vy *= -1;

            score += combo;
            combo++;
            hud();
            if (checkWin()) return;
            break;
        }
    }

    if (ball.y > H + 40) loseLife();

    render();
}

function loseLife() {
    lives--;
    combo = 1;
    hud();

    if (lives <= 0) {
        state = STATE.OVER;
        overlay("GAME OVER");
        return;
    }

    state = STATE.DEAD;
    overlay("RESETTING...");

    setTimeout(() => {
        resetBall(true);
    }, 1000);
}

function render() {
    const el = document.getElementById("ball");
    el.style.left = ball.x + "px";
    el.style.top = ball.y + "px";
    el.style.width = BALL_SIZE + "px";
    el.style.height = BALL_SIZE + "px";
}

function loop() {
    updatePaddle();
    updateBall();
    requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowRight") keys.right = true;
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
});

game.addEventListener("pointermove", e => {
    const r = game.getBoundingClientRect();
    paddle.x = clamp(e.clientX - r.left - paddle.w / 2, 0, W - paddle.w);
});

game.addEventListener("click", launch);

function checkWin() {
    if (bricks.every(b => !b.alive)) {
        state = STATE.OVER;
        overlay("YOU WIN");
        return true;
    }
    return false;
}

function resize() {
    W = game.clientWidth;
    H = game.clientHeight;

    paddle.w = Math.max(110, W * 0.14);

    createBricks();
    resetBall(true);
}

function resetGame() {
    score = 0;
    lives = 3;
    combo = 1;
    state = STATE.READY;

    createBricks();
    resetBall(true);
    hud();
}

function goBack() {
    window.location.href = "../../index.html";
}

createScene();
resize();
hud();
loop();