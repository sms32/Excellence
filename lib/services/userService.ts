import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from 'firebase/auth';

export interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: any;
  lastLogin: any;
  // Add custom fields here
  role: string;
  isActive: boolean;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}

/**
 * Create or update user document in Firestore
 * Called automatically on every login
 */
export const createOrUpdateUserDocument = async (user: User): Promise<UserData> => {
  const userRef = doc(db, 'users', user.uid);
  
  try {
    // Check if user document exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // First time login - create new user document
      const userData: UserData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'student', // Default role
        isActive: true,
        preferences: {
          notifications: true,
          theme: 'light',
        },
      };
      
      await setDoc(userRef, userData);
      console.log('✅ New user document created:', user.uid);
      return userData;
    } else {
      // Existing user - update last login
      await setDoc(
        userRef,
        {
          lastLogin: serverTimestamp(),
          // Update profile info in case it changed
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        { merge: true } // Only update specified fields
      );
      
      console.log('✅ User document updated:', user.uid);
      return userDoc.data() as UserData;
    }
  } catch (error) {
    console.error('❌ Error creating/updating user document:', error);
    throw error;
  }
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};
