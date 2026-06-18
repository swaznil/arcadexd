const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let w, h;

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const particles = Array.from({ length: 180 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.5 + 0.2,
    alpha: Math.random() * 0.4,
    speed: Math.random() * 0.3 + 0.1,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    twinkle: Math.random() * 1000
}));

const detections = Array.from({ length: 12 }, () => ({
    angle: Math.random() * Math.PI * 2,
    distance: Math.random() * 0.7 + 0.25,
    size: Math.random() * 2 + 1.5,
    pulse: Math.random() * 1000
}));

let radarAngle = 0;
let glitchOffset = 0;

function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, h);

    g.addColorStop(0, "#040608");
    g.addColorStop(1, "#000000");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
}

function drawGrid() {
    ctx.strokeStyle = "rgba(0,255,180,0.06)";
    ctx.lineWidth = 1;

    const spacing = 40;

    for (let x = 0; x < w; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    for (let y = 0; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
}

function drawRadar() {
    const cx = w / 2;
    const cy = h / 2;

    radarAngle += 0.005;

    const radius = Math.min(w, h) * 0.55;

    const gradient = ctx.createRadialGradient(cx,cy,0,cx,cy,radius);

    gradient.addColorStop(0, "rgba(0, 255, 179, 0.2)");
    gradient.addColorStop(1, "rgba(0,255,180,0)");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,255,180,0.1)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);

    ctx.lineTo(
        cx + Math.cos(radarAngle) * radius,
        cy + Math.sin(radarAngle) * radius
    ); 

    ctx.stroke();

    // Outer Ring
    ctx.beginPath();
    ctx.arc(cx,cy,radius,0,Math.PI * 2);
    ctx.strokeStyle = "rgba(0,255,180,0.1)";
    ctx.stroke();
}

function drawParticles() {
    for (const p of particles) {

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const alpha =
            p.alpha +
            Math.sin(
                performance.now() * 0.003 +
                p.twinkle
            ) * 0.2;

        ctx.beginPath();

        ctx.fillStyle = `rgba(0,255,180,${p.alpha})`;

        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

        ctx.fill();
    }
}

function drawDetections() {

    const cx = w / 2;
    const cy = h / 2;

    const radius = Math.min(w, h) * 0.55;

    for (const d of detections) {

        const x =
            cx +
            Math.cos(d.angle) *
            radius *
            d.distance;

        const y =
            cy +
            Math.sin(d.angle) *
            radius *
            d.distance;

        const alpha =
            0.25 +
            Math.sin(
                performance.now() * 0.004 +
                d.pulse
            ) * 0.25;

        ctx.beginPath();

        ctx.fillStyle =
            `rgba(0,255,180,${alpha})`;

        ctx.arc(x, y, d.size, 0, Math.PI * 2);

        ctx.fill();

        ctx.strokeStyle =
            `rgba(0,255,180,${alpha * 0.5})`;

        ctx.stroke();
    }
}

function drawScanlines() {
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;

    for (let y = glitchOffset; y < h; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    glitchOffset += 0.3;
}

function drawNoise() {
    for (let i = 0; i < 80; i++) {

        const x = Math.random() * w;
        const y = Math.random() * h;

        ctx.fillStyle = `rgba(255,255,255,${
            Math.random() * 0.03
        })`;

        ctx.fillRect(x, y, 1, 1);
    }
}

function drawWarningFlash() {

    if (Math.random() < 0.004) {

        ctx.fillStyle = "rgba(255,0,80,0.03)";
        ctx.fillRect(0, 0, w, h);

    }
}

function animate() {

    drawBackground();

    drawGrid();

    drawRadar();

    drawDetections();

    drawParticles();

    drawScanlines();

    drawNoise();

    drawWarningFlash();

    requestAnimationFrame(animate);
}

animate();