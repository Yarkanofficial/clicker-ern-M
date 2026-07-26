let score = 0;

document.getElementById("clickBtn").onclick = function () {
    score++;
    document.getElementById("score").innerText = score;
};
