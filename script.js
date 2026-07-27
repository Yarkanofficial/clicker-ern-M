// ==============================
// ClickArena-M Script
// Part 1
// ==============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDD2BOVpD3N_CrgBvHzng948KjIAwEKmCs",
  authDomain: "clickarena-m.firebaseapp.com",
  projectId: "clickarena-m",
  storageBucket: "clickarena-m.firebasestorage.app",
  messagingSenderId: "796812869774",
  appId: "1:796812869774:web:1a704105fc33f3f13a89df",
  measurementId: "G-TYZQB283H3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Game Variables
let currentUser = null;
let clicks = 0;
let coins = 0;
let timeLeft = 0;

// HTML Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const message = document.getElementById("message");

const clicksText = document.getElementById("clicks");
const coinsText = document.getElementById("coins");
const timerText = document.getElementById("timer");
// ==============================
// Register User
// ==============================

if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      message.innerText = "Please enter email and password";
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      currentUser = userCredential.user;

      await setDoc(doc(db, "users", currentUser.uid), {
        email: email,
        clicks: 0,
        coins: 0,
        timeleft: Date.now() + (24 * 60 * 60 * 1000),
        createdAt: serverTimestamp()
      });

      message.innerText = "✅ Account created successfully";

    } catch (error) {
      message.innerText = error.message;
    }
  });
}

// ==============================
// Login User
// ==============================

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      currentUser = userCredential.user;
const userRef = doc(db, "users", currentUser.uid);
const snap = await getDoc(userRef);

if (snap.exists()) {
    const data = snap.data();

    coins = data.coins || 0;
    clicks = data.clicks || 0;

    if (data.timerEnd) {
        timeLeft = Math.max(
            0,
            Math.floor((data.timerEnd - Date.now()) / 1000)
        );
    }

    if (coinsText) coinsText.innerText = "Coins: " + coins;
    if (clicksText) clicksText.innerText = "Clicks: " + clicks;
}
      message.innerText = "✅ Login successful";

    } catch (error) {

      message.innerText = error.message;

    }

  });
}

// ==============================
// Logout
// ==============================

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    location.reload();

  });

  }
// ==============================
// Auth State
// ==============================

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  currentUser = user;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
if (snap.exists()) {
    const data = snap.data();

    clicks = data.clicks || 0;
    coins = data.coins || 0;

    if (clicksText) {
        clicksText.innerText = "Clicks: " + clicks;
    }

    if (coinsText) {
        coinsText.innerText = "Coins: " + coins;
    }

    if (data.timerEnd) {
        timeLeft = Math.max(
            0,
            Math.floor((data.timerEnd - Date.now()) / 1000)
        );
    }
}

updateTimer();
});
// ==============================
// Click Game
// ==============================

window.clickGame = async function () {

  if (!currentUser) {
    message.innerText = "Please login first";
    return;
  }

  clicks++;
  coins++;

  if (clicksText) {
    clicksText.innerText = "Clicks: " + clicks;
  }

  if (coinsText) {
    coinsText.innerText = "Coins: " + coins;
  }

  await updateDoc(
    doc(db, "users", currentUser.uid),
    {
      clicks: clicks,
      coins: coins
    }
  );

};
// ==============================
// Timer
// ==============================

function updateTimer() {

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  if (timerText) {
    timerText.innerText =
      "⏰ " +
      String(hours).padStart(2, "0") + ":" +
      String(minutes).padStart(2, "0") + ":" +
      String(seconds).padStart(2, "0");
  }

  if (timeLeft > 0) {
    timeLeft--;
  }
if (timeLeft <= 0 && currentUser) {
    getDoc(doc(db, "users", currentUser.uid)).then((snap) => {
        if (snap.exists()) {
            const data = snap.data();
            timeLeft = Math.max(
                0,
                Math.floor((data.timerEnd - Date.now()) / 1000)
            );
        }
    });
}
clearInterval(window.timerInterval);

updateTimer();

window.timerInterval = setInterval(() => {
  updateTimer();
  }, 1000);
// ==============================
// Daily Prize
// ==============================
async function claimDailyPrize() {

  if (!currentUser) {
    message.innerText = "Please login first";
    return;
  }

  const userRef = doc(db, "users", currentUser.uid);
  const snap = await getDoc(userRef);

  const data = snap.data();

  const now = Date.now();
  const lastClaim = data.lastClaim || 0;

  if (now - lastClaim < 24 * 60 * 60 * 1000) {

    message.innerText = "⏰ Daily Prize is not ready yet.";

    return;
  }

  coins += 100;

  if (coinsText) {
    coinsText.innerText = "Coins: " + coins;
  }

  await updateDoc(userRef, {
    coins: coins,
    lastClaim: now,
    timerEnd: now + (24 * 60 * 60 * 1000)
});
timeLeft = 24 * 60 * 60;
updateTimer();
  message.innerText = "🎁 +100 Coins!";
}

window.claimDailyPrize = claimDailyPrize;

// ==============================
// Auto Save
// ==============================

setInterval(async () => {

  if (!currentUser) return;

  try {

    await updateDoc(
      doc(db, "users", currentUser.uid),
      {
        clicks: clicks,
        coins: coins
      }
    );

  } catch (e) {
    console.log(e);
  }

}, 10000);

// ==============================
// End
// ==============================

console.log("✅ ClickArena-M Loaded");
