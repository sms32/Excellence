import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Add this

const firebaseConfig = {
  apiKey: "AIzaSyDOjEU8Rt504IBPTCtfuX9Geh83rRczwpU",
  authDomain: "excellence-a5c8d.firebaseapp.com",
  projectId: "excellence-a5c8d",
  storageBucket: "excellence-a5c8d.firebasestorage.app",
  messagingSenderId: "906407142648",
  appId: "1:906407142648:web:1ce9493831fd20a8acc70d",
  measurementId: "G-P0QQ323GH3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app); // Add this

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
