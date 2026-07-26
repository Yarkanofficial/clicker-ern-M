let clicks = Number(localStorage.getItem("clicks")) || 0;

document.getElementById("clicks").innerText = "Clicks: " + clicks;

function clickGame() {
    clicks++;
    document.getElementById("clicks").innerText = "Clicks: " + clicks;
    localStorage.setItem("clicks", clicks);
}

// 24-hour timer
let timeLeft = 24 * 60 * 60;

function updateTimer() {
    let hours = Math.floor(timeLeft / 3600);
    let minutes = Math.floor((timeLeft % 3600) / 60);
    let seconds = timeLeft % 60;

    document.getElementById("timer").innerText =
        "⏰ " +
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    if (timeLeft > 0) {
        timeLeft--;
    }
}

updateTimer();
setInterval(updateTimer, 1000);
