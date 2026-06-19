document.addEventListener("DOMContentLoaded", () => {

    const musicBtn = document.getElementById("music-btn");
    const bgm = document.getElementById("bgm");
    const slider = document.getElementById("volume-slider");

    bgm.volume = 0.35;

    let playing = false;

    const channel = (typeof BroadcastChannel !== "undefined") ? new BroadcastChannel('bgm') : null;

    function updateStateFromStorage() {
        try {
            const s = localStorage.getItem('bgm-playing');
            playing = s === '1';
            const vol = localStorage.getItem('bgm-volume');
            if (vol !== null) slider.value = vol;
            bgm.volume = slider.value;
            musicBtn.textContent = playing ? '🔊' : '🔈';
        } catch (e) {
            console.error('storage read failed', e);
        }
    }

    if (channel) {
        channel.addEventListener('message', (ev) => {
            const msg = ev.data;
            if (!msg || !msg.type) return;
            if (msg.type === 'request-state') {
                channel.postMessage({ type: 'state', playing: playing, volume: slider.value });
            } else if (msg.type === 'play') {
                bgm.play().catch(()=>{});
                playing = true;
                musicBtn.textContent = '🔊';
            } else if (msg.type === 'pause') {
                bgm.pause();
                playing = false;
                musicBtn.textContent = '🔈';
            } else if (msg.type === 'volume') {
                slider.value = msg.volume;
                bgm.volume = msg.volume;
            } else if (msg.type === 'state') {
                    
                if (msg.playing) {
                    bgm.play().catch(()=>{});
                    playing = true;
                    musicBtn.textContent = '🔊';
                } else {
                    bgm.pause();
                    playing = false;
                    musicBtn.textContent = '🔈';
                }
                if (msg.volume !== undefined) {
                    slider.value = msg.volume;
                    bgm.volume = msg.volume;
                }
            }
        });
    }

    musicBtn.addEventListener("click", async () => {
        if (!playing) {
            try {
                await bgm.play();
                playing = true;
                musicBtn.textContent = "🔊";
                try { localStorage.setItem('bgm-playing','1'); } catch(e){}
                if (channel) channel.postMessage({ type: 'play' });
            } catch (err) {
                console.log("Audio blocked:", err);
            }
        } else {
            bgm.pause();
            playing = false;
            musicBtn.textContent = "🔈";
            try { localStorage.setItem('bgm-playing','0'); } catch(e){}
            if (channel) channel.postMessage({ type: 'pause' });
        }
    });

    slider.addEventListener("input", () => {
        bgm.volume = slider.value;
        try { localStorage.setItem('bgm-volume', slider.value); } catch(e){}
        if (channel) channel.postMessage({ type: 'volume', volume: slider.value });
    });

});

const container = document.querySelector(".audio-container");

container.addEventListener("click", (e) => {
    if (e.target.id !== "music-btn") return;
    container.classList.toggle("open");
});

try { updateStateFromStorage(); } catch(e){}
if (typeof BroadcastChannel !== 'undefined') {
    try { (new BroadcastChannel('bgm')).postMessage({ type: 'request-state' }); } catch(e){}
}

try {
    musicBtn.classList.add("playing");
    musicBtn.classList.remove("playing");
} catch(e) {}