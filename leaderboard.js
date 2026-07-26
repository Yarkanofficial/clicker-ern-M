// ==============================
// ClickArena M
// Leaderboard Part 1
// ==============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
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
const db = getFirestore(app);

const leaderboardBody = document.getElementById("leaderboardBody");
// ==============================
// Load Leaderboard
// ==============================

async function loadLeaderboard() {

  const snapshot = await getDocs(collection(db, "users"));

  let players = [];

  snapshot.forEach((doc) => {

    players.push(doc.data());

  });

  players.sort((a, b) => b.coins - a.coins);

  leaderboardBody.innerHTML = "";

  players.forEach((player, index) => {

    leaderboardBody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${player.email}</td>
        <td>${player.coins}</td>
      </tr>
    `;

  });

}

loadLeaderboard();
// ==============================
// Leaderboard Part 3
// ==============================

try {
  loadLeaderboard();
} catch (error) {
  console.error(error);

  if (leaderboardBody) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3">
          Failed to load leaderboard.
        </td>
      </tr>
    `;
  }
}

console.log("✅ Leaderboard Loaded");
