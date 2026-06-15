const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let w, h;
let mouseX = 0;
let mouseY = 0;

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    mouseX = w / 2;
    mouseY = h / 2;
}

window.addEventListener("resize", resize);

window.addEventListener("mousemove", (e) => {
    mouseX += (e.clientX - mouseX) * 0.15;
    mouseY += (e.clientY - mouseY) * 0.15;
});

resize();

const particles = Array.from({ length: 240 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 2 + 0.05,
    vx: (Math.random() - 0.5) * 0.1,
    vy: (Math.random() - 0.5) * 0.1,
    alpha: Math.random() * 0.25 + 0.5
}));

const blobs = [
    {
        x: w * 0.3,
        y: h * 0.3,
        radius: 280,
        color: "rgba(80,220,255,0.07)",
        speed: 0.0002,
        offset: Math.random() * 1000
    },
    {
        x: w * 0.7,
        y: h * 0.4,
        radius: 340,
        color: "rgba(120,140,255,0.05)",
        speed: 0.00015,
        offset: Math.random() * 1000
    },
    {
        x: w * 0.5,
        y: h * 0.8,
        radius: 380,
        color: "rgba(255,255,255,0.025)",
        speed: 0.0001,
        offset: Math.random() * 1000
    }
];

function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, h);

    g.addColorStop(0, "#171717");
    g.addColorStop(0.5, "#0f0f0f");
    g.addColorStop(1, "#070707");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
}

function drawAurora() {
    const t = performance.now();

    ctx.save();
    ctx.filter = "blur(140px)";

    for (const blob of blobs) {
        const x =
            blob.x +
            Math.sin(t * blob.speed + blob.offset) * 120;

        const y =
            blob.y +
            Math.cos(t * blob.speed + blob.offset) * 80;

        ctx.fillStyle = blob.color;

        ctx.beginPath();
        ctx.arc(x, y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawParticles() {
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;

        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();

        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;

        ctx.arc(
            p.x,
            p.y,
            p.r,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

function drawMouseLight() {
    const gradient = ctx.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        350
    );

    gradient.addColorStop(
        0,
        "rgba(120,220,255,0.06)"
    );

    gradient.addColorStop(
        0.5,
        "rgba(120,220,255,0.025)"
    );

    gradient.addColorStop(
        1,
        "rgba(120,220,255,0)"
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
}

function animate() {
    drawBackground();

    drawAurora();

    drawParticles();

    drawMouseLight();

    requestAnimationFrame(animate);
}

animate();