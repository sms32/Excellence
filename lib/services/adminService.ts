import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Category, Candidate, VotingSettings } from '../types/voting';


// ==================== CATEGORY MANAGEMENT ====================


/**
 * Create a new category
 */
export const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const newCategoryRef = doc(categoriesRef);
    
    const category: Category = {
      id: newCategoryRef.id,
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(newCategoryRef, category);
    console.log('✅ Category created:', newCategoryRef.id);
    return newCategoryRef.id;
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw error;
  }
};


/**
 * Update existing category
 */
export const updateCategory = async (categoryId: string, updates: Partial<Category>): Promise<void> => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Category updated:', categoryId);
  } catch (error) {
    console.error('❌ Error updating category:', error);
    throw error;
  }
};


/**
 * Delete category (only if no candidates exist)
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    // Check if category has candidates
    const candidatesRef = collection(db, 'candidates');
    const q = query(candidatesRef, where('categoryId', '==', categoryId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error(`Cannot delete category. It has ${snapshot.size} candidate(s). Delete candidates first.`);
    }
    
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
    
    console.log('✅ Category deleted:', categoryId);
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
};


/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw error;
  }
};


/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categoryDoc = await getDoc(categoryRef);
    
    if (categoryDoc.exists()) {
      return {
        id: categoryDoc.id,
        ...categoryDoc.data()
      } as Category;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    return null;
  }
};


// ==================== CANDIDATE MANAGEMENT ====================


/**
 * Create a new candidate
 */
export const createCandidate = async (candidateData: Omit<Candidate, 'id' | 'totalVotes' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Check if category already has 3 candidates
    const candidatesRef = collection(db, 'candidates');
    const q = query(candidatesRef, where('categoryId', '==', candidateData.categoryId));
    const snapshot = await getDocs(q);
    
    if (snapshot.size >= 3) {
      throw new Error('This category already has 3 candidates. Maximum limit reached.');
    }
    
    const newCandidateRef = doc(candidatesRef);
    
    const candidate: Candidate = {
      id: newCandidateRef.id,
      ...candidateData,
      totalVotes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(newCandidateRef, candidate);
    console.log('✅ Candidate created:', newCandidateRef.id);
    return newCandidateRef.id;
  } catch (error) {
    console.error('❌ Error creating candidate:', error);
    throw error;
  }
};


/**
 * Update existing candidate
 */
export const updateCandidate = async (candidateId: string, updates: Partial<Candidate>): Promise<void> => {
  try {
    const candidateRef = doc(db, 'candidates', candidateId);
    
    // Don't allow updating totalVotes through this method
    const { totalVotes, ...safeUpdates } = updates;
    
    await updateDoc(candidateRef, {
      ...safeUpdates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Candidate updated:', candidateId);
  } catch (error) {
    console.error('❌ Error updating candidate:', error);
    throw error;
  }
};


/**
 * Delete candidate
 */
export const deleteCandidate = async (candidateId: string): Promise<void> => {
  try {
    const candidateRef = doc(db, 'candidates', candidateId);
    const candidateDoc = await getDoc(candidateRef);
    
    if (!candidateDoc.exists()) {
      throw new Error('Candidate not found');
    }
    
    const candidateData = candidateDoc.data() as Candidate;
    
    // Warning: This will run on server-side during build, so we skip window.confirm
    // The confirmation is handled in the component layer
    
    await deleteDoc(candidateRef);
    console.log('✅ Candidate deleted:', candidateId);
  } catch (error) {
    console.error('❌ Error deleting candidate:', error);
    throw error;
  }
};


/**
 * Get all candidates
 */
export const getAllCandidates = async (): Promise<Candidate[]> => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const snapshot = await getDocs(candidatesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Candidate));
  } catch (error) {
    console.error('❌ Error fetching candidates:', error);
    throw error;
  }
};


/**
 * Get candidates by category
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
    console.error('❌ Error fetching candidates:', error);
    throw error;
  }
};


/**
 * Get candidate count for a category
 */
export const getCandidateCount = async (categoryId: string): Promise<number> => {
  try {
    const candidates = await getCandidatesByCategory(categoryId);
    return candidates.length;
  } catch (error) {
    console.error('❌ Error getting candidate count:', error);
    return 0;
  }
};


// ==================== DASHBOARD STATS ====================


/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async () => {
  try {
    const [categories, candidates, usersSnapshot] = await Promise.all([
      getAllCategories(),
      getAllCandidates(),
      getDocs(collection(db, 'users'))
    ]);
    
    const totalUsers = usersSnapshot.size;
    const totalVotes = candidates.reduce((sum, c) => sum + c.totalVotes, 0);
    
    // Calculate completion rate
    let completedUsers = 0;
    for (const userDoc of usersSnapshot.docs) {
      const progressRef = doc(db, 'users', userDoc.id, 'voting', 'progress');
      const progressDoc = await getDoc(progressRef);
      if (progressDoc.exists() && progressDoc.data().isComplete) {
        completedUsers++;
      }
    }
    
    return {
      totalCategories: categories.length,
      totalCandidates: candidates.length,
      totalUsers,
      totalVotes,
      completionRate: totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0,
      completedUsers
    };
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    throw error;
  }
};


/**
 * Get category setup status
 */
export const getCategorySetupStatus = async () => {
  try {
    const categories = await getAllCategories();
    const statusPromises = categories.map(async (category) => {
      const candidateCount = await getCandidateCount(category.id);
      return {
        category,
        candidateCount,
        isComplete: candidateCount === 3,
        status: candidateCount === 3 ? 'Ready' : candidateCount === 0 ? 'Empty' : 'Incomplete'
      };
    });
    
    return await Promise.all(statusPromises);
  } catch (error) {
    console.error('❌ Error fetching setup status:', error);
    throw error;
  }
};


// ==================== RESULTS & ANALYTICS ====================


/**
 * Get voting results for a specific category
 */
export const getCategoryResults = async (categoryId: string) => {
  try {
    const [candidates, summaryDoc] = await Promise.all([
      getCandidatesByCategory(categoryId),
      getDoc(doc(db, 'voteSummary', categoryId))
    ]);

    const summary = summaryDoc.exists() ? summaryDoc.data() : { votes: {}, totalVoters: 0 };
    
    // Calculate results for each candidate
    const results = candidates.map(candidate => {
      const votes = summary.votes?.[candidate.id] || 0;
      const percentage = summary.totalVoters > 0 
        ? ((votes / summary.totalVoters) * 100).toFixed(2)
        : '0.00';
      
      return {
        ...candidate,
        votes,
        percentage: parseFloat(percentage)
      };
    });

    // Sort by votes (descending)
    results.sort((a, b) => b.votes - a.votes);

    return {
      categoryId,
      totalVoters: summary.totalVoters || 0,
      candidates: results,
      lastUpdated: summary.lastUpdated
    };
  } catch (error) {
    console.error('Error fetching category results:', error);
    throw error;
  }
};


/**
 * Get all voting results (all categories)
 */
export const getAllVotingResults = async () => {
  try {
    const categories = await getAllCategories();
    
    const results = await Promise.all(
      categories.map(category => getCategoryResults(category.id))
    );

    return results;
  } catch (error) {
    console.error('Error fetching all results:', error);
    throw error;
  }
};


/**
 * Get overall voting statistics
 */
export const getVotingStatistics = async () => {
  try {
    // Get all users who have started voting
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    let totalVoters = 0;
    let completedVoters = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const progressRef = doc(db, 'users', userDoc.id, 'voting', 'progress');
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const progress = progressDoc.data();
        if (progress.totalVotes > 0) {
          totalVoters++;
          if (progress.isComplete) {
            completedVoters++;
          }
        }
      }
    }

    const categories = await getAllCategories();
    const totalCategories = categories.length;

    return {
      totalVoters,
      completedVoters,
      inProgressVoters: totalVoters - completedVoters,
      totalCategories,
      completionRate: totalVoters > 0 
        ? ((completedVoters / totalVoters) * 100).toFixed(2)
        : '0.00'
    };
  } catch (error) {
    console.error('Error fetching voting statistics:', error);
    throw error;
  }
};


// ==================== VOTING CONTROL ====================


/**
 * Get current voting settings
 */
export const getVotingSettings = async (): Promise<VotingSettings> => {
  try {
    const settingsRef = doc(db, 'settings', 'voting');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      // Default settings if doesn't exist
      const defaultSettings: VotingSettings = {
        isOpen: false,
        openedAt: null,
        closedAt: null,
        closedMessage: 'Voting is currently closed. Please check back later.',
        announcementMessage: ''
      };
      
      await setDoc(settingsRef, defaultSettings);
      return defaultSettings;
    }
    
    const data = settingsDoc.data();
    
    // Properly cast to VotingSettings
    return {
      isOpen: data.isOpen ?? false,
      openedAt: data.openedAt ?? null,
      closedAt: data.closedAt ?? null,
      closedMessage: data.closedMessage ?? 'Voting is currently closed.',
      announcementMessage: data.announcementMessage ?? ''
    } as VotingSettings;
  } catch (error) {
    console.error('Error fetching voting settings:', error);
    throw error;
  }
};


/**
 * Update voting settings
 */
export const updateVotingSettings = async (settings: Partial<VotingSettings>): Promise<void> => {
  try {
    const settingsRef = doc(db, 'settings', 'voting');
    
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('✅ Voting settings updated');
  } catch (error) {
    console.error('❌ Error updating voting settings:', error);
    throw error;
  }
};


/**
 * Open voting
 */
export const openVoting = async (): Promise<void> => {
  try {
    await updateVotingSettings({
      isOpen: true,
      openedAt: serverTimestamp() as any
    });
  } catch (error) {
    console.error('Error opening voting:', error);
    throw error;
  }
};


/**
 * Close voting with custom message
 */
export const closeVoting = async (closedMessage: string): Promise<void> => {
  try {
    await updateVotingSettings({
      isOpen: false,
      closedAt: serverTimestamp() as any,
      closedMessage
    });
  } catch (error) {
    console.error('Error closing voting:', error);
    throw error;
  }
};
