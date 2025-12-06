import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Add this

const firebaseConfig = {
  apiKey: "AIzaSyD9S32YX7NgSeIjT9w7-eQ-L1yc7egJxIQ",
  authDomain: "excellence-21fbb.firebaseapp.com",
  projectId: "excellence-21fbb",
  storageBucket: "excellence-21fbb.firebasestorage.app",
  messagingSenderId: "105964750970",
  appId: "1:105964750970:web:7c193c0d4db561308713c3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app); // Add this

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
