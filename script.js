import { db } from "./firebase.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let clicks = Number(localStorage.getItem("clicks")) || 0;

document.getElementById("clicks").innerText = "Clicks: " + clicks;

async function clickGame() {
    clicks++;

    document.getElementById("clicks").innerText = "Clicks: " + clicks;

    localStorage.setItem("clicks", clicks);

    try {
        await addDoc(collection(db, "clicks"), {
            clicks: clicks,
            time: new Date()
        });
    } catch (error) {
        console.log(error);
    }
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
const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        document.getElementById("message").innerText = "Enter email and password";
        return;
    }

    try {
        await addDoc(collection(db, "users"), {
            email: email,
            password: password,
            createdAt: new Date()
        });

        document.getElementById("message").innerText = "Registered successfully!";
    } catch (error) {
        document.getElementById("message").innerText = error.message;
    }
});
