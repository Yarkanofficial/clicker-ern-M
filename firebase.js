//
// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDD2BOVpD3N_CrgBvHzng948KjIAwEKmCs",
  authDomain: "clickarena-m.firebaseapp.com",
  projectId: "clickarena-m",
  storageBucket: "clickarena-m.firebasestorage.app",
  messagingSenderId: "796812869774",
  appId: "1:796812869774:web:1a704105fc33f3f13a89df",
  measurementId: "G-TYZQB283H3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
