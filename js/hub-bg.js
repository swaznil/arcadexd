const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let w, h;


function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const stars = Array.from({ length: 320 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.4 + 0.3,
    speed: Math.random() * 0.05 + 0.01,
    phase: Math.random() * Math.PI * 2
}));

// grid motion
let gridOffset = 0;

// shooting star
let shoot = { active: false, x: 0, y: 0 };
let shootTimer = 0;

// spawn shooting star
function spawnShoot() {
    shoot.active = true;
    shoot.x = Math.random() * w;
    shoot.y = Math.random() * h * 0.3;
}

function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#040012");
    g.addColorStop(1, "#000000");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
}

function drawStars() {
    for (let s of stars) {
        s.y += s.speed * 0.0005;

        if (s.y > 1) s.y = 0;

        const twinkle = 0.3 + Math.sin(Date.now() * 0.001 + s.phase) * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

// grid
function drawGrid() {
    const horizon = h * 0.65;

    gridOffset += 0.15;

    ctx.strokeStyle = "rgba(0, 255, 255, 0.55)";
    ctx.lineWidth = 1.2;

    const spacing = 45;

    // horizontal lines
    for (let y = horizon; y < h; y += spacing) {
        const yy = y + (gridOffset % spacing);

        ctx.beginPath();
        ctx.moveTo(0, yy);
        ctx.lineTo(w, yy);
        ctx.stroke();
    }

    // vertical lines
    const cx = w / 2;

    for (let x = -10; x <= 10; x++) {
        ctx.beginPath();
        ctx.moveTo(cx, horizon);
        ctx.lineTo(cx + x * 85, h);
        ctx.stroke();
    }
}

// fog
function drawFog() {
    const horizon = h * 0.65;

    const fog = ctx.createLinearGradient(0, horizon, 0, h);
    fog.addColorStop(0, "rgba(0,0,0,0)");
    fog.addColorStop(1, "rgba(0,0,0,0.85)");

    ctx.fillStyle = fog;
    ctx.fillRect(0, horizon, w, h - horizon);
}

// shooting star
function drawShoot() {
    if (!shoot.active) return;

    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(shoot.x, shoot.y);
    ctx.lineTo(shoot.x - 70, shoot.y + 30);
    ctx.stroke();

    shoot.x -= 4;
    shoot.y += 2;

    if (shoot.x < 0 || shoot.y > h) {
        shoot.active = false;
    }
}

// loop
function loop() {
    drawBackground();
    drawStars();
    drawGrid();
    drawFog();
    drawShoot();

    // shooting star timing
    shootTimer++;

    if (shootTimer > 900) {
        spawnShoot();
        shootTimer = 0;
    }

    requestAnimationFrame(loop);
}

loop();