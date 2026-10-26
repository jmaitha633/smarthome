
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxA_IWf89JP8KBmrb1mPOSyrpzcIofUzw",
  authDomain: "smart-home-security-17f15.firebaseapp.com",
  databaseURL: "https://smart-home-security-17f15-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "smart-home-security-17f15",
  storageBucket: "smart-home-security-17f15.firebasestorage.app",
  messagingSenderId: "811870987728",
  appId: "1:811870987728:web:f1da51bddc5f62a5aa05d5",
  measurementId: "G-2P64RREPBE"
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app);
export default app;

