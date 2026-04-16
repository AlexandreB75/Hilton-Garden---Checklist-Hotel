import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDFykRjxgjtghLKdFbgbj30gyKOycSTXwk",
  authDomain: "hilton-garden-checklist-hotel.firebaseapp.com",
  projectId: "hilton-garden-checklist-hotel",
  storageBucket: "hilton-garden-checklist-hotel.firebasestorage.app",
  messagingSenderId: "132516143751",
  appId: "1:132516143751:web:ca47ee7d5fd6fecd064e22",
  databaseURL: "https://hilton-garden-checklist-hotel-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
