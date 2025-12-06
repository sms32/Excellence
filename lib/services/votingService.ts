import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query,
  where,
  orderBy,
  increment,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Category, Candidate, UserVote, VotingProgress } from '../types/voting';

/**
 * Get all categories ordered by sequence
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get candidates for a specific category
 */
export const getCandidatesByCategory = async (categoryId: string): Promise<Candidate[]> => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const q = query(candidatesRef, where('categoryId', '==', categoryId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Candidate));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};

/**
 * Get user's voting progress
 */
export const getUserVotingProgress = async (userId: string): Promise<VotingProgress> => {
  try {
    const progressRef = doc(db, 'users', userId, 'voting', 'progress');
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      return progressDoc.data() as VotingProgress;
    }
    
    // Initialize if doesn't exist
    const initialProgress: VotingProgress = {
      currentCategory: 0,
      completedCategories: [],
      totalVotes: 0,
      isComplete: false
    };
    
    await setDoc(progressRef, initialProgress);
    return initialProgress;
  } catch (error) {
    console.error('Error fetching voting progress:', error);
    throw error;
  }
};

/**
 * Check if user has voted in a specific category
 */
export const hasUserVotedInCategory = async (
  userId: string, 
  categoryId: string
): Promise<boolean> => {
  try {
    const voteRef = doc(db, 'users', userId, 'votes', categoryId);
    const voteDoc = await getDoc(voteRef);
    return voteDoc.exists();
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
};

/**
 * Get user's vote for a specific category
 */
export const getUserVoteForCategory = async (
  userId: string, 
  categoryId: string
): Promise<UserVote | null> => {
  try {
    const voteRef = doc(db, 'users', userId, 'votes', categoryId);
    const voteDoc = await getDoc(voteRef);
    
    if (voteDoc.exists()) {
      return {
        categoryId,
        ...voteDoc.data()
      } as UserVote;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user vote:', error);
    return null;
  }
};

/**
 * Submit a vote (with transaction to prevent double voting)
 */
/**
 * Submit a vote (with transaction to prevent double voting)
 */
export const submitVote = async (
  userId: string,
  categoryId: string,
  candidateId: string,
  candidateName: string
): Promise<void> => {
  try {
    // First, get total categories count OUTSIDE transaction
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    const totalCategories = categoriesSnapshot.size;

    await runTransaction(db, async (transaction) => {
      // References
      const voteRef = doc(db, 'users', userId, 'votes', categoryId);
      const progressRef = doc(db, 'users', userId, 'voting', 'progress');
      const candidateRef = doc(db, 'candidates', candidateId);
      const summaryRef = doc(db, 'voteSummary', categoryId);
      
      // ===== ALL READS FIRST =====
      
      // 1. Check if already voted
      const existingVote = await transaction.get(voteRef);
      if (existingVote.exists()) {
        throw new Error('You have already voted in this category');
      }
      
      // 2. Get current progress
      const progressDoc = await transaction.get(progressRef);
      const currentProgress = progressDoc.exists() 
        ? progressDoc.data() as VotingProgress
        : {
            currentCategory: 0,
            completedCategories: [],
            totalVotes: 0,
            isComplete: false
          };
      
      // 3. Get current summary (for updating vote counts)
      const summaryDoc = await transaction.get(summaryRef);
      
      // ===== ALL WRITES AFTER READS =====
      
      // 1. Record the vote
      transaction.set(voteRef, {
        candidateId,
        candidateName,
        votedAt: serverTimestamp()
      });
      
      // 2. Update candidate total votes
      transaction.update(candidateRef, {
        totalVotes: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // 3. Update or create vote summary
      if (summaryDoc.exists()) {
        // Summary exists - update it
        transaction.update(summaryRef, {
          [`votes.${candidateId}`]: increment(1),
          totalVoters: increment(1),
          lastUpdated: serverTimestamp()
        });
      } else {
        // Summary doesn't exist - create it
        transaction.set(summaryRef, {
          categoryId,
          totalVoters: 1,
          votes: {
            [candidateId]: 1
          },
          lastUpdated: serverTimestamp()
        });
      }
      
      // 4. Update user progress
      const updatedProgress: VotingProgress = {
        currentCategory: currentProgress.currentCategory + 1,
        completedCategories: [...currentProgress.completedCategories, categoryId],
        totalVotes: currentProgress.totalVotes + 1,
        isComplete: currentProgress.totalVotes + 1 >= totalCategories
      };
      
      transaction.set(progressRef, updatedProgress);
    });
    
    console.log('✅ Vote submitted successfully');
  } catch (error) {
    console.error('❌ Error submitting vote:', error);
    throw error;
  }
};


/**
 * Get all user's votes
 */
export const getAllUserVotes = async (userId: string): Promise<UserVote[]> => {
  try {
    const votesRef = collection(db, 'users', userId, 'votes');
    const snapshot = await getDocs(votesRef);
    
    return snapshot.docs.map(doc => ({
      categoryId: doc.id,
      ...doc.data()
    } as UserVote));
  } catch (error) {
    console.error('Error fetching user votes:', error);
    return [];
  }
};

/**
 * Get current voting settings (for users to check if voting is open)
 */
export const getVotingSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', 'voting');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      return settingsDoc.data();
    }
    
    // Default: voting is open if no settings exist
    return {
      isOpen: true,
      closedMessage: 'Voting is currently closed. Please check back later.',
      announcementMessage: ''
    };
  } catch (error) {
    console.error('Error fetching voting settings:', error);
    // Default to open on error
    return {
      isOpen: true,
      closedMessage: 'Voting is currently closed. Please check back later.',
      announcementMessage: ''
    };
  }
};
