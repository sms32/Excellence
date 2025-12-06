'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  getCategories,
  getCandidatesByCategory,
  getUserVotingProgress,
  getUserVoteForCategory,
  submitVote,
  getVotingSettings
} from '@/lib/services/votingService';
import { Category, Candidate, VotingProgress } from '@/lib/types/voting';

interface VotingSettings {
  isOpen: boolean;
  closedMessage?: string;
  announcementMessage?: string;
}

export default function VotingPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votingProgress, setVotingProgress] = useState<VotingProgress | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [votedCandidateName, setVotedCandidateName] = useState('');
  const [votingSettings, setVotingSettings] = useState<VotingSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadVotingData();
    }
  }, [user]);

  useEffect(() => {
    if (categories.length > 0 && currentCategoryIndex < categories.length && votingSettings?.isOpen) {
      loadCurrentCategoryData();
    }
  }, [categories, currentCategoryIndex, votingSettings]);

  const loadVotingData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      const settingsData = await getVotingSettings();
      if (settingsData) {
  setVotingSettings(settingsData as VotingSettings);
}


      const [categoriesData, progressData] = await Promise.all([
        getCategories(),
        getUserVotingProgress(user.uid)
      ]);

      if (categoriesData.length === 0) {
        setError('No voting categories available yet. Please check back later.');
        setLoading(false);
        return;
      }

      setCategories(categoriesData);
      setVotingProgress(progressData);

      if (progressData.isComplete) {
        setCurrentCategoryIndex(categoriesData.length);
      } else {
        setCurrentCategoryIndex(progressData.currentCategory);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading voting data:', error);
      setError('Failed to load voting data. Please refresh the page.');
      setLoading(false);
    }
  };

  const loadCurrentCategoryData = async () => {
    if (!user || !categories[currentCategoryIndex]) return;

    try {
      const currentCategory = categories[currentCategoryIndex];
      const candidatesData = await getCandidatesByCategory(currentCategory.id);
      
      if (candidatesData.length === 0) {
        setError(`No candidates available for ${currentCategory.name}. Please contact admin.`);
        return;
      }

      setCandidates(candidatesData);

      const existingVote = await getUserVoteForCategory(user.uid, currentCategory.id);
      
      if (existingVote) {
        setAlreadyVoted(true);
        setSelectedCandidate(existingVote.candidateId);
        setVotedCandidateName(existingVote.candidateName);
      } else {
        setAlreadyVoted(false);
        setSelectedCandidate(null);
        setVotedCandidateName('');
      }
    } catch (error) {
      console.error('Error loading category data:', error);
      setError('Failed to load candidates. Please try again.');
    }
  };

const handleVote = async () => {
  if (!user || !selectedCandidate) return;

  const currentCategory = categories[currentCategoryIndex];
  const candidate = candidates.find(c => c.id === selectedCandidate);
  
  if (!candidate) return;

  setSubmitting(true);
  setError('');

  try {
    await submitVote(
      user.uid,
      currentCategory.id,
      candidate.id,
      candidate.name
    );

    // Move to next category
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setSelectedCandidate(null);
    } else {
      // Voting complete
      setCurrentCategoryIndex(categories.length);
    }

    // Reload progress
    const updatedProgress = await getUserVotingProgress(user.uid);
    setVotingProgress(updatedProgress);
  } catch (error: unknown) {
    console.error('Error submitting vote:', error);
    if (error instanceof Error) {
      setError(error.message || 'Failed to submit vote. Please try again.');
    } else {
      setError(String(error) || 'Failed to submit vote. Please try again.');
    }
  } finally {
    setSubmitting(false);
  }
};


  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      await signOut();
      router.push('/');
    }
  };

  // Loading State
  if (authLoading || loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
          fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
        }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto"
            style={{ borderColor: '#D4AF37' }}
          ></div>
          <p className="mt-4 font-medium" style={{ color: '#E8E8E8' }}>Loading voting system...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // VOTING CLOSED
  if (votingSettings && !votingSettings.isOpen) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
          fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
        }}
      >
        <div 
          className="max-w-2xl w-full rounded-2xl shadow-2xl p-8 text-center"
          style={{
            background: 'rgba(4, 29, 26, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
        >
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"
            style={{ background: 'rgba(239, 68, 68, 0.2)' }}
          >
            <span className="text-5xl">🔒</span>
          </div>
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: '#D4AF37' }}
          >
            Voting is Closed
          </h1>
          
          <div 
            className="rounded-xl p-6 mb-8"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <p className="text-lg font-medium" style={{ color: '#FCA5A5' }}>
              {votingSettings.closedMessage || 'Voting is currently closed. Please check back later.'}
            </p>
          </div>

          {votingProgress && votingProgress.totalVotes > 0 && (
            <div 
              className="rounded-xl p-6 mb-6"
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
            >
              <h3 className="font-semibold mb-4" style={{ color: '#D4AF37' }}>Your Voting Progress</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#D4AF37' }}>{votingProgress.totalVotes}</p>
                  <p className="text-sm" style={{ color: '#B8956D' }}>Votes Cast</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#E8E8E8' }}>{categories.length}</p>
                  <p className="text-sm" style={{ color: '#B8956D' }}>Total Categories</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#D4AF37' }}>
                    {Math.round((votingProgress.totalVotes / categories.length) * 100)}%
                  </p>
                  <p className="text-sm" style={{ color: '#B8956D' }}>Complete</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
              color: '#021210',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(212, 175, 55, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (currentCategoryIndex >= categories.length || votingProgress?.isComplete) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
          fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
        }}
      >
        <div 
          className="max-w-2xl w-full rounded-2xl shadow-2xl p-8 text-center"
          style={{
            background: 'rgba(4, 29, 26, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
        >
          <div className="mb-6">
            
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: '#D4AF37' }}
            >
              Thank You for Voting! 
            </h1>
            <p className="text-lg mb-2" style={{ color: '#E8E8E8' }}>
              You have successfully completed voting in all the {categories.length} categories.
            </p>
            <p style={{ color: '#94A3B8' }}>
              Your votes have been recorded and will be counted in the final results.
            </p>
          </div>

          
          <button
            onClick={handleLogout}
            className="px-8 py-3 rounded-lg font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
              color: '#021210',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(212, 175, 55, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const currentCategory = categories[currentCategoryIndex];

  // Error State
  if (error && candidates.length === 0) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
          fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
        }}
      >
        <div 
          className="max-w-md w-full rounded-2xl shadow-2xl p-8 text-center"
          style={{
            background: 'rgba(4, 29, 26, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
        >
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>Something Went Wrong</h2>
          <p className="mb-6" style={{ color: '#E8E8E8' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg transition-all font-semibold"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
              color: '#021210',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Main Voting Interface
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'linear-gradient(135deg, #021210 0%, #031815 20%, #041d1a 40%, #05221f 60%, #062724 80%, #021210 100%)',
        fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
      }}
    >
      {/* Header Bar with Logout */}
      {/* Header Bar with Logout - Responsive with Georgia Pro Bold */}
<div 
  className="py-4 px-4"
  style={{
    borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
    backdropFilter: 'blur(10px)',
    fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif'
  }}
>
  <div className="max-w-5xl mx-auto flex items-center justify-between">
    <h1 
      className="text-sm md:text-xl font-bold"
      style={{ 
        color: '#E8E8E8',
        letterSpacing: '0.05em',
        fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif',
        fontWeight: 700
      }}
    >
      Women&apos;s Excellence Awards
    </h1>
    
    {/* Logout Button - Responsive */}
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-all duration-300"
      style={{
        background: 'rgba(212, 175, 55, 0.1)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        color: '#D4AF37',
        cursor: 'pointer',
        fontFamily: '"Georgia Pro", Georgia, "Times New Roman", serif',
        fontWeight: 600
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
      }}
    >
      <svg 
        className="w-3 h-3 md:w-4 md:h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
        />
      </svg>
      <span className="text-xs md:text-sm font-semibold">Logout</span>
    </button>
  </div>
</div>


      {/* Main Content - Even More Compact */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Category Name and Description */}
        <div className="text-center mb-6">
          <h2 
            className="text-2xl font-normal mb-2"
            style={{ 
              color: '#D4AF37',
              letterSpacing: '0.03em'
            }}
          >
            {currentCategory.name}
          </h2>
          <p 
            className="text-sm max-w-xl mx-auto"
            style={{ 
              color: '#94A3B8',
              lineHeight: '1.6'
            }}
          >
            {currentCategory.description}
          </p>
        </div>

        {alreadyVoted && (
          <div 
            className="rounded-xl p-4 mb-5 text-center max-w-xl mx-auto"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">✅</span>
              <h3 className="text-base font-semibold" style={{ color: '#4ADE80' }}>
                You&apos;ve Already Voted
              </h3>
            </div>
            <p className="text-xs mb-2" style={{ color: '#86EFAC' }}>
              You voted for <strong>{votedCandidateName}</strong> in this category.
            </p>
            <button
              onClick={() => {
                if (currentCategoryIndex < categories.length - 1) {
                  setCurrentCategoryIndex(currentCategoryIndex + 1);
                } else {
                  setCurrentCategoryIndex(categories.length);
                }
              }}
              className="px-4 py-1.5 rounded-lg font-medium text-xs transition-all"
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ADE80',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
              }}
            >
              Continue to Next Category →
            </button>
          </div>
        )}

        {error && (
          <div 
            className="rounded-xl p-3 mb-5 flex items-start gap-2 max-w-xl mx-auto"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#EF4444' }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-xs" style={{ color: '#FCA5A5' }}>{error}</p>
          </div>
        )}

        {/* Candidates Grid - Much Smaller */}
        {!alreadyVoted && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    background: 'rgba(107, 114, 128, 0.25)',
                    border: selectedCandidate === candidate.id 
                      ? '2px solid #D4AF37' 
                      : '1px solid rgba(212, 175, 55, 0.2)',
                    boxShadow: selectedCandidate === candidate.id 
                      ? '0 5px 20px rgba(212, 175, 55, 0.35)' 
                      : '0 2px 10px rgba(0, 0, 0, 0.3)',
                    transform: selectedCandidate === candidate.id ? 'scale(1.01)' : 'scale(1)',
                    position: 'relative'
                  }}
                >
                  {/* Selection Checkmark */}
                  {selectedCandidate === candidate.id && (
                    <div 
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center z-10"
                      style={{ 
                        background: '#D4AF37',
                        boxShadow: '0 2px 8px rgba(212, 175, 55, 0.5)'
                      }}
                    >
                      <span className="text-lg text-[#021210]">✓</span>
                    </div>
                  )}

                  {/* Candidate Image - Smaller */}
                  <div className="relative h-56 bg-gray-700 overflow-hidden">
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-full h-full object-cover transition-transform duration-300"
                      style={{
                        transform: selectedCandidate === candidate.id ? 'scale(1.05)' : 'scale(1)'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=No+Image';
                      }}
                    />
                  </div>

                  {/* Candidate Info - More Compact */}
                  <div className="p-3">
                    <h3 
                      className="text-base font-semibold mb-0.5"
                      style={{ 
                        color: '#E8E8E8',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {candidate.name}
                    </h3>
                    <p 
                      className="text-xs mb-2"
                      style={{ 
                        color: '#D4AF37',
                        letterSpacing: '0.03em'
                      }}
                    >
                      {currentCategory.name}
                    </p>
                    <p 
                      className="text-xs line-clamp-2 mb-2.5"
                      style={{ 
                        color: '#94A3B8',
                        lineHeight: '1.4'
                      }}
                    >
                      {candidate.description}
                    </p>
                    
                    <button
                      onClick={() => setSelectedCandidate(candidate.id)}
                      className="w-full py-1.5 rounded-lg font-medium text-xs transition-all duration-300"
                      style={{
                        background: selectedCandidate === candidate.id 
                          ? 'rgba(212, 175, 55, 0.2)' 
                          : 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                        border: selectedCandidate === candidate.id 
                          ? '1px solid rgba(212, 175, 55, 0.5)' 
                          : 'none',
                        color: selectedCandidate === candidate.id ? '#D4AF37' : '#021210',
                        cursor: 'pointer',
                        letterSpacing: '0.05em'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCandidate !== candidate.id) {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 3px 10px rgba(212, 175, 55, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {selectedCandidate === candidate.id ? '✓ Voted' : 'VOTE CAST'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button - Smaller & Refined */}
            <div className="flex justify-center">
              <button
                onClick={handleVote}
                disabled={!selectedCandidate || submitting}
                className="px-10 py-2.5 rounded-xl font-semibold text-base flex items-center gap-2 transition-all duration-300"
                style={{
                  background: (!selectedCandidate || submitting) 
                    ? 'rgba(212, 175, 55, 0.3)' 
                    : 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                  color: '#021210',
                  cursor: (!selectedCandidate || submitting) ? 'not-allowed' : 'pointer',
                  opacity: (!selectedCandidate || submitting) ? 0.5 : 1,
                  boxShadow: (!selectedCandidate || submitting) 
                    ? 'none' 
                    : '0 4px 18px rgba(212, 175, 55, 0.4)',
                  letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => {
                  if (selectedCandidate && !submitting) {
                    e.currentTarget.style.transform = 'scale(1.03) translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(212, 175, 55, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCandidate && !submitting) {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(212, 175, 55, 0.4)';
                  }
                }}
              >
                {submitting ? (
                  <>
                    <div 
                      className="animate-spin rounded-full h-4 w-4 border-b-2"
                      style={{ borderColor: '#021210' }}
                    ></div>
                    <span>Submitting Vote...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Vote</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

            {!selectedCandidate && (
              <p 
                className="text-center mt-3 text-xs"
                style={{ color: '#94A3B8' }}
              >
                Please select a candidate to continue
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
