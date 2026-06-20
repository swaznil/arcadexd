document.addEventListener("DOMContentLoaded", () => {

    const isSubFolder =
        window.location.pathname.includes("/games/");

    const prefix =
        isSubFolder
            ? "../../"
            : "";

    let musicBtn =
        document.getElementById("music-btn");

    let slider =
        document.getElementById("volume-slider");

    let bgm =
        document.getElementById("bgm");

    if (!bgm) {

        const audioContainer =
            document.createElement("div");

        audioContainer.className =
            "audio-container";

        audioContainer.innerHTML = `
            <button id="music-btn">🔈</button>

            <input
                type="range"
                id="volume-slider"
                min="0"
                max="1"
                step="0.01"
                value="0.35"
            >

            <audio id="bgm" loop>
                <source
                    src="${prefix}assets/audio/retrowave-electronica.mp3"
                    type="audio/mpeg"
                >
            </audio>
        `;

        document.body.appendChild(audioContainer);

        musicBtn =
            document.getElementById("music-btn");

        slider =
            document.getElementById("volume-slider");

        bgm =
            document.getElementById("bgm");
    }

    const container =
        document.querySelector(".audio-container");

    if (localStorage.getItem("bgm-open") === "1") {
        container.classList.add("open");
    } else {
        container.classList.remove("open");
    }

    container.addEventListener("click", (e) => {

        if (e.target.id === "music-btn") {
            container.classList.toggle("open");

            localStorage.setItem(
                "bgm-open",
                container.classList.contains("open") ? "1" : "0"
            );
        }
    });

    const channel =
        typeof BroadcastChannel !== "undefined"
            ? new BroadcastChannel("bgm")
            : null;

    let playing =
        localStorage.getItem("bgm-playing") === "1";

    const savedVolume =
        localStorage.getItem("bgm-volume");

    if (savedVolume !== null) {
        bgm.volume = parseFloat(savedVolume);
    } else {
        bgm.volume = 0.35;
    }

    slider.value =
        String(bgm.volume);

    function updateUI() {

        musicBtn.textContent =
            playing ? "🔊" : "🔈";

        musicBtn.classList.toggle(
            "playing",
            playing
        );
    }

    function saveTime() {

        localStorage.setItem(
            "bgm-time",
            bgm.currentTime
        );
    }

    function loadSavedTime() {

        const savedTime =
            localStorage.getItem("bgm-time");

        if (savedTime !== null) {
            bgm.currentTime =
                parseFloat(savedTime);
        }
    }

    loadSavedTime();

    if (playing) {

        bgm.play()
            .then(updateUI)
            .catch(updateUI);

    } else {
        updateUI();
    }

    bgm.addEventListener("timeupdate", () => {

        if (
            playing &&
            Math.floor(bgm.currentTime) % 3 === 0
        ) {
            saveTime();
        }
    });

    window.addEventListener("beforeunload", () => {
        saveTime();
    });

    musicBtn.addEventListener("click", async () => {

        container.classList.toggle("open");

        localStorage.setItem(
            "bgm-open",
            container.classList.contains("open") ? "1" : "0"
        );

        if (!playing) {

            try {

                await bgm.play();
                playing = true;

                if (channel) {
                    channel.postMessage({
                        type: "play",
                        time: bgm.currentTime
                    });
                }

                localStorage.setItem("bgm-playing", "1");

            } catch (err) {
                console.log(err);
            }

        } else {

            bgm.pause();
            playing = false;

            if (channel) {
                channel.postMessage({
                    type: "pause"
                });
            }

            localStorage.setItem("bgm-playing", "0");
        }

        updateUI();
    });

    slider.addEventListener("input", () => {

        const volume =
            parseFloat(slider.value);

        bgm.volume = volume;

        localStorage.setItem(
            "bgm-volume",
            volume
        );

        if (channel) {

            channel.postMessage({
                type: "volume",
                volume
            });
        }
    });

    if (channel) {

        channel.addEventListener("message", (e) => {

            const msg = e.data;

            if (!msg) return;

            if (msg.type === "play") {

                playing = true;

                if (
                    typeof msg.time === "number" &&
                    Math.abs(
                        bgm.currentTime - msg.time
                    ) > 1
                ) {
                    bgm.currentTime = msg.time;
                }

                bgm.play().catch(() => {});

            } else if (msg.type === "pause") {

                playing = false;
                bgm.pause();

            } else if (msg.type === "volume") {

                bgm.volume =
                    parseFloat(msg.volume);

                slider.value =
                    String(msg.volume);

            } else if (msg.type === "sync") {

                if (typeof msg.time === "number") {

                    const drift =
                        Math.abs(bgm.currentTime - msg.time);

                    if (drift > 0.5) {
                        bgm.currentTime = msg.time;
                    }

                    if (msg.playing && !playing) {
                        bgm.play().catch(() => {});
                        playing = true;
                    }
                }
            }

            updateUI();
        });

        channel.postMessage({
            type: "sync",
            time: bgm.currentTime,
            playing
        });

        setInterval(() => {

            if (!playing) return;

            channel.postMessage({
                type: "sync",
                time: bgm.currentTime,
                playing: true
            });

        }, 2000);
    }
});