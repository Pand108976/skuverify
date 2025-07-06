import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDMrwhkmww7-p8G2wSfiIJr4a_GWk9t2K0",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "sku-search-3451b.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "sku-search-3451b",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "sku-search-3451b.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "653166735676",
  appId: process.env.FIREBASE_APP_ID || "1:653166735676:web:01b366f624a93663646e39"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); 