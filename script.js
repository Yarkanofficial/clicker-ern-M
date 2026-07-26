let clicks = localStorage.getItem("clicks");

if (clicks === null) {
    clicks = 0;
}

clicks = Number(clicks);

document.getElementById("clicks").innerText = "Clicks: " + clicks;

function clickGame() {
    clicks++;

    document.getElementById("clicks").innerText = "Clicks: " + clicks;

    localStorage.setItem("clicks", clicks);
}
