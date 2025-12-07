import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Add this

const firebaseConfig = {
  apiKey: "AIzaSyCLX48mlhDwnhUfIKMrbDK8uDnx-YJ8S9A",
  authDomain: "excellence-c8cec.firebaseapp.com",
  projectId: "excellence-c8cec",
  storageBucket: "excellence-c8cec.firebasestorage.app",
  messagingSenderId: "938208419190",
  appId: "1:938208419190:web:50410cdcd5b15c25292e57"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app); // Add this

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
