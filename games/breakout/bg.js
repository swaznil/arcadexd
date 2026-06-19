(() => {
    const canvas = document.getElementById("bg");
    const ctx = canvas.getContext("2d");

    let w, h;
    let mouseX = 0;
    let mouseY = 0;

    const BRICK_W = 120;
    const BRICK_H = 34;
    const BRICK_GAP = 14;

    const bricks = [];
    const streams = [];
    const particles = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;

        mouseX = w / 2;
        mouseY = h / 2;

        createBricks();
    }

    function createBricks() {
        bricks.length = 0;

        const cols = Math.ceil(w / (BRICK_W + BRICK_GAP));

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < cols; col++) {
                if (Math.random() < 0.08) continue;

                bricks.push({
                    x: col * (BRICK_W + BRICK_GAP),
                    y: 50 + row * (BRICK_H + BRICK_GAP),
                    alpha: 0.03 + Math.random() * 0.04,
                    pulse: Math.random() * Math.PI * 2
                });
            }
        }
    }

    function createStreams() {
        streams.length = 0;

        for (let i = 0; i < 20; i++) {
            streams.push({
                x: Math.random() * w,
                y: Math.random() * h,
                speed: 0.4 + Math.random(),
                length: 60 + Math.random() * 120
            });
        }
    }

    function createParticles() {
        particles.length = 0;

        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: 0.5 + Math.random() * 2,
                speed: 0.1 + Math.random() * 0.3,
                alpha: 0.15 + Math.random() * 0.25
            });
        }
    }

    function drawBackground() {
        const bg = ctx.createLinearGradient(0, 0, 0, h);

        bg.addColorStop(0, "#0d1418");
        bg.addColorStop(1, "#06090c");

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
    }

    function drawGrid() {
        ctx.strokeStyle = "rgba(0,255,200,0.05)";
        ctx.lineWidth = 1;

        const size = 40;

        for (let x = 0; x < w; x += size) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        for (let y = 0; y < h; y += size) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }

    function drawStreams() {
        for (const stream of streams) {
            stream.y -= stream.speed;

            if (stream.y < -stream.length) {
                stream.y = h + stream.length;
                stream.x = Math.random() * w;
            }

            const fade = ctx.createLinearGradient(
                stream.x,
                stream.y,
                stream.x,
                stream.y + stream.length
            );

            fade.addColorStop(0, "rgba(0,255,200,0)");
            fade.addColorStop(1, "rgba(0,255,200,0.15)");

            ctx.strokeStyle = fade;

            ctx.beginPath();
            ctx.moveTo(stream.x, stream.y);
            ctx.lineTo(stream.x, stream.y + stream.length);
            ctx.stroke();
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

    function drawBricks() {
        const time = performance.now() * 0.001;

        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0,255,200,0.3)";

        for (const brick of bricks) {
            const alpha =
                brick.alpha +
                Math.sin(time + brick.pulse) * 0.02;

            ctx.strokeStyle = `rgba(0,255,200,${alpha})`;

            ctx.strokeRect(
                brick.x,
                brick.y,
                BRICK_W,
                BRICK_H
            );
        }

        ctx.shadowBlur = 0;
    }

    function drawMouseGlow() {
        const glow = ctx.createRadialGradient(
            mouseX,
            mouseY,
            0,
            mouseX,
            mouseY,
            120
        );

        glow.addColorStop(0, "rgba(0,255,200,0.1)");
        glow.addColorStop(1, "rgba(0,255,200,0)");

        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
    }

    function render() {
        ctx.clearRect(0, 0, w, h);

        drawBackground();
        drawGrid();
        drawStreams();
        drawParticles();
        drawBricks();
        drawMouseGlow();

        requestAnimationFrame(render);
    }

    function init() {
        resize();
        createStreams();
        createParticles();

        window.addEventListener("resize", resize);

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        render();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();