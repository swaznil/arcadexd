document.addEventListener("DOMContentLoaded", () => {

    const musicBtn = document.getElementById("music-btn");
    const bgm = document.getElementById("bgm");
    const slider = document.getElementById("volume-slider");

    bgm.volume = 0.35;

    let playing = false;

    musicBtn.addEventListener("click", async () => {
        if (!playing) {
            try {
                await bgm.play();
                playing = true;
                musicBtn.textContent = "🔊";
            } catch (err) {
                console.log("Audio blocked:", err);
            }
        } else {
            bgm.pause();
            playing = false;
            musicBtn.textContent = "🔈";
        }
    });

    slider.addEventListener("input", () => {
        bgm.volume = slider.value;
    });

});

const container = document.querySelector(".audio-container");

container.addEventListener("click", (e) => {
    if (e.target.id !== "music-btn") return;
    container.classList.toggle("open");
});

musicBtn.classList.add("playing");
musicBtn.classList.remove("playing");