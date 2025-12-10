import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDCNjXrya6Ol-HPveDZfIKT8JY95xpSlgY",
  authDomain: "hunt-manifest-app.firebaseapp.com",
  projectId: "hunt-manifest-app",
  storageBucket: "hunt-manifest-app.firebasestorage.app",
  messagingSenderId: "921830682082",
  appId: "1:921830682082:web:4e5a4279cdc923fd93ddbb"
};

// Initialize Firebase (prevent re-initialization in development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
