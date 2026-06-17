const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let w, h;
let movePulse = 0;
let energy = 0;

const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    active: false
};

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
});

resize();

const particles = Array.from({ length: 180 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    r: Math.random() * 2.2 + 0.5,
    alpha: Math.random() * 0.5 + 0.2,

    hue: Math.random() < 0.5
        ? "0,229,255"
        : "168,85,247"
}));


const bursts = [];

window.addEventListener("2048-merge", e => {

    const strength = Math.log2(e.detail.value || 2);

    bursts.push({
        x: w / 2,
        y: h / 2,
        r: 0,
        alpha: 1,
        strength
    });

    for (const p of particles) {

        const dx = p.x - w / 2;
        const dy = p.y - h / 2;
        const dist =Math.sqrt(dx * dx + dy * dy) + 0.01;
        const force = strength * 0.15;

        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
    }
});

window.addEventListener("2048-move", () => {
    movePulse = 1;
    energy += 0.4;
});

function drawBackground() {

    const g =ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0, "#050816");
    g.addColorStop(1, "#02030a");

    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
}

function drawAmbientGlow() {

    const g = ctx.createRadialGradient(w / 2,h / 2,100,w / 2,h / 2,Math.max(w,h) * 0.7);
    g.addColorStop(0,`rgba(0,229,255,${0.08 + energy * 0.08})`);
    g.addColorStop(0.5,"rgba(168,85,247,0.04)");
    g.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
}


function drawParticles() {

    for (const p of particles) {

        if (mouse.active) {

            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 180) {

                const force =(1 - dist / 180) * 0.02;
                p.vx += dx * force * 0.02;
                p.vy += dy * force * 0.02;
            }
        }

        p.vx += Math.sin(performance.now() * 0.001 + p.y * 0.01) * 0.0005;
        p.vy += Math.cos(performance.now() * 0.001 + p.x * 0.01) * 0.0005;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;

        ctx.beginPath();
        const boosted = p.alpha + energy * 0.15;
        ctx.fillStyle = `rgba(${p.hue},${boosted})`;
        ctx.arc(p.x,p.y,p.r,0,Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle =`rgba(${p.hue},${p.alpha * 0.12})`;
        ctx.arc(p.x,p.y,p.r * 5,0,Math.PI * 2);
        ctx.fill();
    }
}

function drawLinks() {

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {

            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {

                const alpha = (1 - dist / 120) * (0.04 + energy * 0.08);
                ctx.strokeStyle =`rgba(120,220,255,${alpha})`;
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }
    }
}


function drawBursts() {

    for (let i = bursts.length - 1; i >= 0; i--) {

        const b = bursts[i];
        b.r += 4 + b.strength * 0.5;
        b.alpha *= 0.94;

        if (b.alpha < 0.02) {
            bursts.splice(i, 1);
            continue;
        }

        ctx.strokeStyle =`rgba(0,229,255,${b.alpha})`;
        ctx.lineWidth = 2 + b.strength * 0.2;
        ctx.beginPath();
        ctx.arc(b.x,b.y,b.r,0,Math.PI * 2);
        ctx.stroke();
    }
}

function drawMovePulse() {

    if (movePulse <= 0) return;

    ctx.fillStyle = `rgba(255,255,255,${movePulse * 0.025})`;
    ctx.fillRect(0,0,w,h);
    movePulse *= 0.92;
}


function drawVignette() {

    const g = ctx.createRadialGradient(w / 2, h / 2, 200, w / 2, h / 2, Math.max(w,h));
    g.addColorStop(0,"rgba(0,0,0,0)");
    g.addColorStop(1,"rgba(0,0,0,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
}


function animate() {

    drawBackground();

    drawAmbientGlow();

    drawLinks();

    drawParticles();

    drawBursts();

    drawMovePulse();

    drawVignette();

    requestAnimationFrame(animate);
}

animate();