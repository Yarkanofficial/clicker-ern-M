let score = 0;

document.getElementById("clickBtn").addEventListener("click", function () {
    score++;
    document.getElementById("score").textContent = score;
});
