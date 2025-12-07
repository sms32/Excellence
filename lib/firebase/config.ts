import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Add this

const firebaseConfig = {
  apiKey: "AIzaSyAkLb2gsL-cehiIptQufPKeL9j_n2bKmwA",
  authDomain: "excellence-d749d.firebaseapp.com",
  projectId: "excellence-d749d",
  storageBucket: "excellence-d749d.firebasestorage.app",
  messagingSenderId: "547974181804",
  appId: "1:547974181804:web:e5c50569b137c0b12ec009"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app); // Add this

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
