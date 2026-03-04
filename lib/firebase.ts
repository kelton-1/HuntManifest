import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDCNjXrya6Ol-HPveDZfIKT8JY95xpSlgY",
  authDomain: "hunt-manifest-app.firebaseapp.com",
  projectId: "hunt-manifest-app",
  storageBucket: "hunt-manifest-app.firebasestorage.app",
  messagingSenderId: "921830682082",
  appId: "1:921830682082:web:4e5a4279cdc923fd93ddbb"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

let authInstance: ReturnType<typeof getAuth>;
if (getApps().length === 1 && Platform.OS !== 'web') {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    authInstance = getAuth(app);
  }
} else {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export default app;
