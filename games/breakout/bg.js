(() => {
    const canvas = document.getElementById("bg");
    const ctx = canvas.getContext("2d");

    let w = 0;
    let h = 0;

    let mouseX = 0;
    let mouseY = 0;

    const bricks = [];
    const streams = [];
    const ripples = [];
    const particles = [];

    let rippleTimer = 0;

    function resizeCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;

        mouseX = w * 0.5;
        mouseY = h * 0.5;

        buildBricks();
    }

    function buildBricks() {
        bricks.length = 0;

        const bw = 120;
        const bh = 34;
        const gap = 14;

        const cols = Math.ceil(w / (bw + gap));
        const rows = 8;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                bricks.push({
                    x: x * (bw + gap),
                    y: 50 + y * (bh + gap),
                    alpha: Math.random() * 0.05 + 0.02,
                    pulse: Math.random() * Math.PI * 2,
                    broken: Math.random() < 0.08
                });
            }
        }
    }

    function createStreams() {
        streams.length = 0;

        for (let i = 0; i < 25; i++) {
            streams.push({
                x: Math.random() * w,
                y: Math.random() * h,
                speed: Math.random() * 1 + 0.4,
                len: Math.random() * 120 + 60
            });
        }
    }

    function createParticles() {
        particles.length = 0;

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.3 + 0.1,
                alpha: Math.random() * 0.4 + 0.1
            });
        }
    }

    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, "#05080a");
        gradient.addColorStop(1, "#020304");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    function drawGrid() {
        ctx.strokeStyle = "rgba(0,255,200,0.03)";
        ctx.lineWidth = 1;

        const gap = 40;

        for (let x = 0; x < w; x += gap) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        for (let y = 0; y < h; y += gap) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }

    function drawBricks() {
        const time = performance.now() * 0.001;

        ctx.lineWidth = 2;

        for (const brick of bricks) {
            if (brick.broken) continue;

            const glow =
                brick.alpha +
                Math.sin(time + brick.pulse) * 0.025;

            ctx.strokeStyle = `rgba(0,255,200,${glow})`;

            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(0,255,200,0.35)";

            ctx.strokeRect(brick.x, brick.y, 120, 34);
        }

        ctx.shadowBlur = 0;
    }

    function drawStreams() {
        for (const stream of streams) {
            stream.y -= stream.speed;

            if (stream.y < -stream.len) {
                stream.y = h + stream.len;
                stream.x = Math.random() * w;
            }

            const gradient = ctx.createLinearGradient(
                stream.x,
                stream.y,
                stream.x,
                stream.y + stream.len
            );

            gradient.addColorStop(0, "rgba(0,255,200,0)");
            gradient.addColorStop(1, "rgba(0,255,200,0.12)");

            ctx.strokeStyle = gradient;

            ctx.beginPath();
            ctx.moveTo(stream.x, stream.y);
            ctx.lineTo(stream.x, stream.y + stream.len);
            ctx.stroke();
        }
    }

    function spawnRipple() {
        ripples.push({
            x: w * 0.5 + (Math.random() - 0.5) * 500,
            y: h * 0.35 + (Math.random() - 0.5) * 200,
            r: 0
        });
    }

    function drawRipples() {
        rippleTimer++;

        if (rippleTimer > 160) {
            rippleTimer = 0;
            spawnRipple();
        }

        for (let i = ripples.length - 1; i >= 0; i--) {
            const ripple = ripples[i];

            ripple.r += 2.2;

            const alpha = Math.max(0, 0.12 - ripple.r / 2200);

            ctx.strokeStyle = `rgba(0,255,200,${alpha})`;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
            ctx.stroke();

            if (ripple.r > 320) ripples.splice(i, 1);
        }
    }

    function drawParticles() {
        for (const p of particles) {
            p.y -= p.speed;

            if (p.y < -10) {
                p.y = h + 10;
                p.x = Math.random() * w;
            }

            ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawMouseGlow() {
        const glow = ctx.createRadialGradient(
            mouseX,
            mouseY,
            0,
            mouseX,
            mouseY,
            240
        );

        glow.addColorStop(0, "rgba(0,255,200,0.08)");
        glow.addColorStop(1, "rgba(0,255,200,0)");

        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
    }

    function drawScanlines() {
        ctx.fillStyle = "rgba(255,255,255,0.015)";

        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1);
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);

        drawBackground();
        drawGrid();
        drawStreams();
        drawParticles();
        drawBricks();
        drawRipples();
        drawMouseGlow();
        drawScanlines();

        requestAnimationFrame(animate);
    }

    function init() {
        resizeCanvas();
        createStreams();
        createParticles();

        window.addEventListener("resize", resizeCanvas);

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        animate();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();