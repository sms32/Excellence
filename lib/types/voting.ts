export interface Category {
  id: string;
  name: string;
  order: number;
  description: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Candidate {
  id: string;
  name: string;
  categoryId: string;
  photo: string;
  description: string;
  order: number; // ✅ NEW: Display order (1, 2, 3)
  totalVotes: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserVote {
  categoryId: string;
  candidateId: string;
  candidateName: string;
  votedAt: any;
}

export interface VotingProgress {
  currentCategory: number;
  completedCategories: string[];
  totalVotes: number;
  isComplete: boolean;
}

export interface VoteSummary {
  categoryId: string;
  totalVoters: number;
  votes: Record<string, number>; // candidateId: voteCount
  lastUpdated: any;
}

export interface VotingSettings {
  isOpen: boolean;
  openedAt?: any;
  closedAt?: any;
  closedMessage?: string;
  announcementMessage?: string;
  createdAt?: any;
  updatedAt?: any;
}
