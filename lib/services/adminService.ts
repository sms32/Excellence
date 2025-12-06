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
 * Get next available order number for a category
 */
export const getNextCandidateOrder = async (categoryId: string): Promise<number> => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const q = query(
      candidatesRef, 
      where('categoryId', '==', categoryId),
      orderBy('order', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return 1; // First candidate
    }
    
    const highestOrder = snapshot.docs[0].data().order || 0;
    return highestOrder + 1;
  } catch (error) {
    console.error('❌ Error getting next order:', error);
    // If error (like missing order field), count candidates and add 1
    const candidates = await getCandidatesByCategory(categoryId);
    return candidates.length + 1;
  }
};

/**
 * Check if order number is already taken in category
 */
export const isOrderTaken = async (categoryId: string, order: number, excludeCandidateId?: string): Promise<boolean> => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const q = query(
      candidatesRef,
      where('categoryId', '==', categoryId),
      where('order', '==', order)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return false;
    }
    
    // If editing, check if the existing order belongs to the same candidate
    if (excludeCandidateId) {
      const existingCandidate = snapshot.docs[0];
      return existingCandidate.id !== excludeCandidateId;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking order:', error);
    return false;
  }
};

/**
 * Create a new candidate with order
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
    
    // Validate order number
    if (!candidateData.order || candidateData.order < 1 || candidateData.order > 3) {
      throw new Error('Order must be between 1 and 3');
    }
    
    // Check if order is already taken
    const orderTaken = await isOrderTaken(candidateData.categoryId, candidateData.order);
    if (orderTaken) {
      throw new Error(`Order ${candidateData.order} is already taken in this category. Please choose a different order.`);
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
    console.log('✅ Candidate created:', newCandidateRef.id, 'with order:', candidateData.order);
    return newCandidateRef.id;
  } catch (error) {
    console.error('❌ Error creating candidate:', error);
    throw error;
  }
};

/**
 * Update existing candidate with order validation
 */
export const updateCandidate = async (candidateId: string, updates: Partial<Candidate>): Promise<void> => {
  try {
    const candidateRef = doc(db, 'candidates', candidateId);
    const candidateDoc = await getDoc(candidateRef);
    
    if (!candidateDoc.exists()) {
      throw new Error('Candidate not found');
    }
    
    const currentData = candidateDoc.data() as Candidate;
    
    // Don't allow updating totalVotes through this method
    const { totalVotes, ...safeUpdates } = updates;
    
    // If order is being updated, validate it
    if (safeUpdates.order !== undefined) {
      if (safeUpdates.order < 1 || safeUpdates.order > 3) {
        throw new Error('Order must be between 1 and 3');
      }
      
      // Check if new order is already taken (excluding current candidate)
      const orderTaken = await isOrderTaken(currentData.categoryId, safeUpdates.order, candidateId);
      if (orderTaken) {
        throw new Error(`Order ${safeUpdates.order} is already taken in this category. Please choose a different order.`);
      }
    }
    
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
    
    await deleteDoc(candidateRef);
    console.log('✅ Candidate deleted:', candidateId);
  } catch (error) {
    console.error('❌ Error deleting candidate:', error);
    throw error;
  }
};

/**
 * Get all candidates (sorted by order within category)
 */
export const getAllCandidates = async (): Promise<Candidate[]> => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const snapshot = await getDocs(candidatesRef);
    
    const candidates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Candidate));
    
    // Sort by order (handle missing order field)
    candidates.sort((a, b) => {
      const orderA = a.order || 999;
      const orderB = b.order || 999;
      return orderA - orderB;
    });
    
    return candidates;
  } catch (error) {
    console.error('❌ Error fetching candidates:', error);
    throw error;
  }
};

/**
 * Get candidates by category (ordered by display order)
 */
export const getCandidatesByCategory = async (categoryId: string): Promise<Candidate[]> => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const q = query(
      candidatesRef, 
      where('categoryId', '==', categoryId),
      orderBy('order', 'asc') // ✅ Sort by order
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Candidate));
  } catch (error) {
    console.error('❌ Error fetching candidates:', error);
    
    // Fallback: If order field doesn't exist yet, fetch without ordering
    try {
      const fallbackQuery = query(candidatesRef, where('categoryId', '==', categoryId));
      const fallbackSnapshot = await getDocs(fallbackQuery);
      
      const candidates = fallbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Candidate));
      
      // Sort by order field if it exists, otherwise by creation time
      candidates.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        }
        return 0;
      });
      
      return candidates;
    } catch (fallbackError) {
      console.error('❌ Fallback query also failed:', fallbackError);
      throw fallbackError;
    }
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
 * Get voting results for a specific category (ordered by candidate order)
 */
export const getCategoryResults = async (categoryId: string) => {
  try {
    const [candidates, summaryDoc] = await Promise.all([
      getCandidatesByCategory(categoryId), // Already sorted by order
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

    // Option 1: Keep original order (by candidate.order)
    // results is already sorted by order from getCandidatesByCategory
    
    // Option 2: Sort by votes (descending) - Uncomment if you want results sorted by votes
    // results.sort((a, b) => b.votes - a.votes);

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
