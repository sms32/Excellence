'use client';

import { useEffect, useState } from 'react';
import { 
  getAllCategories,
  getCategoryResults
} from '@/lib/services/adminService';
import { Category } from '@/lib/types/voting';

interface CandidateResult {
  id: string;
  name: string;
  photo: string;
  votes: number;
  percentage: number;
  totalVotes: number;
}

interface CategoryResult {
  categoryId: string;
  totalVoters: number;
  candidates: CandidateResult[];
  lastUpdated: any;
}

export default function AdminDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryResult, setCategoryResult] = useState<CategoryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryResults(selectedCategory);
    }
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoriesData = await getAllCategories();

      setCategories(categoriesData);

      // Auto-select first category
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryResults = async (categoryId: string) => {
    try {
      setLoadingResults(true);
      const results = await getCategoryResults(categoryId);
      setCategoryResult(results);
    } catch (error) {
      console.error('Error loading category results:', error);
    } finally {
      setLoadingResults(false);
    }
  };

  const getWinnerBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform rotate-12"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)' }}>
            <span className="text-2xl">🥇</span>
          </div>
        );
      case 1:
        return (
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
            <span className="text-2xl">🥈</span>
          </div>
        );
      case 2:
        return (
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
            <span className="text-2xl">🥉</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getCategoryName = (categoryId: string): string => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto"
            style={{ borderColor: '#D4AF37' }}
          />
          <p className="mt-4 font-medium" style={{ color: '#E8E8E8' }}>Loading results...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div 
          className="rounded-2xl shadow-2xl p-12 text-center max-w-md w-full"
          style={{ 
            background: 'rgba(4, 29, 26, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
        >
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#D4AF37' }}>No Categories Yet</h3>
          <p style={{ color: '#94A3B8' }}>Create categories and start voting to see results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#D4AF37', letterSpacing: '0.02em' }}>
            Voting Results
          </h1>
          <p className="mt-2 text-lg" style={{ color: '#94A3B8' }}>
            Live voting analytics and results
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Category Selection */}
      <div 
        className="rounded-2xl shadow-lg p-6"
        style={{ 
          background: 'rgba(4, 29, 26, 0.95)',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <h3 className="font-semibold mb-4 text-lg" style={{ color: '#E8E8E8' }}>
          Select Category
        </h3>
        <div className="flex gap-3 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="px-6 py-3 rounded-lg font-medium transition-all"
              style={selectedCategory === category.id ? {
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                color: '#021210',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              } : {
                background: 'rgba(107, 114, 128, 0.3)',
                color: '#E8E8E8',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)';
                }
              }}
            >
              {category.order}. {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category Results */}
      {loadingResults ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
              style={{ borderColor: '#D4AF37' }}
            />
            <p className="mt-4" style={{ color: '#94A3B8' }}>Loading results...</p>
          </div>
        </div>
      ) : categoryResult ? (
        <div className="space-y-6">
          {/* Category Header */}
          <div 
            className="rounded-2xl shadow-lg p-8"
            style={{ 
              background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
              color: '#021210'
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {getCategoryName(categoryResult.categoryId)}
                </h2>
                <p className="text-lg opacity-90">
                  Total Votes: {categoryResult.totalVoters}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">Last Updated</p>
                <p className="text-lg font-semibold">
                  {categoryResult.lastUpdated?.toDate?.()?.toLocaleString() || 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {categoryResult.candidates.length === 0 ? (
            <div 
              className="rounded-2xl shadow-lg p-12 text-center"
              style={{ 
                background: 'rgba(4, 29, 26, 0.95)',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}
            >
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#D4AF37' }}>
                No Votes Yet
              </h3>
              <p style={{ color: '#94A3B8' }}>
                This category hasn't received any votes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categoryResult.candidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="rounded-2xl overflow-hidden transition-all hover:scale-102 relative"
                  style={{ 
                    background: 'rgba(4, 29, 26, 0.95)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* Winner Badge */}
                  {getWinnerBadge(index)}

                  {/* Candidate Image */}
                  <div className="relative h-80 bg-gray-700 overflow-hidden">
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=No+Image';
                      }}
                    />
                    {/* Percentage Overlay */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 p-6"
                      style={{
                        background: 'linear-gradient(to top, rgba(2, 18, 16, 0.95) 0%, transparent 100%)'
                      }}
                    >
                      <div className="text-center">
                        <p className="text-6xl font-bold mb-2" style={{ color: '#D4AF37' }}>
                          {candidate.percentage}%
                        </p>
                        <p className="text-lg" style={{ color: '#E8E8E8' }}>
                          {candidate.votes} votes
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold" style={{ color: '#E8E8E8' }}>
                        {candidate.name}
                      </h3>
                      <div 
                        className="px-4 py-2 rounded-full font-bold"
                        style={
                          index === 0 ? { background: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37' } :
                          index === 1 ? { background: 'rgba(156, 163, 175, 0.2)', color: '#9CA3AF' } :
                          index === 2 ? { background: 'rgba(251, 146, 60, 0.2)', color: '#FB923C' } :
                          { background: 'rgba(96, 165, 250, 0.2)', color: '#60A5FA' }
                        }
                      >
                        #{index + 1}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div 
                      className="w-full rounded-full h-4 overflow-hidden mb-2"
                      style={{ background: 'rgba(107, 114, 128, 0.3)' }}
                    >
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${candidate.percentage}%`,
                          background: index === 0 ? 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)' :
                                    index === 1 ? 'linear-gradient(to right, #9CA3AF, #6B7280)' :
                                    index === 2 ? 'linear-gradient(to right, #FB923C, #F97316)' :
                                    'linear-gradient(to right, #60A5FA, #3B82F6)'
                        }}
                      />
                    </div>
                    <p className="text-sm text-right" style={{ color: '#94A3B8' }}>
                      {candidate.votes} / {categoryResult.totalVoters} voters
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
