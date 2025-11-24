// src/services/FirebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBSnzEGjGF3X4JEVFa-vbsSSX9DaUTSv-k",
  authDomain: "listajogosps2.firebaseapp.com",
  projectId: "listajogosps2",
  storageBucket: "listajogosps2.appspot.com",
  messagingSenderId: "870755213601",
  appId: "1:870755213601:web:66bc2ffe9bee65e4995e60",
  measurementId: "G-PF9V5T1BYZ",
};

// Evita inicialização duplicada no web
const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
export const db = getFirestore(app);
