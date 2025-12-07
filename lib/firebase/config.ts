import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Add this

const firebaseConfig = {
 apiKey: "AIzaSyB-X5ltcv8NEu7FnldnmXlYFYKNfIg_ZJM",
  authDomain: "excellence-7f02e.firebaseapp.com",
  projectId: "excellence-7f02e",
  storageBucket: "excellence-7f02e.firebasestorage.app",
  messagingSenderId: "969706056796",
  appId: "1:969706056796:web:007a04088bc9002abc0a99"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app); // Add this

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
