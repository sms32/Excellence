'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  getAllCategories,
  getAllCandidates,
  getCandidatesByCategory,
  createCandidate,
  updateCandidate,
  deleteCandidate
} from '@/lib/services/adminService';
import { Category, Candidate } from '@/lib/types/voting';
import Link from 'next/link';

export default function CandidatesPage() {
  const searchParams = useSearchParams();
  const preselectedCategoryId = searchParams.get('category');

  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    photo: '',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (preselectedCategoryId && categories.length > 0) {
      setSelectedCategoryFilter(preselectedCategoryId);
    }
  }, [preselectedCategoryId, categories]);

  useEffect(() => {
    filterCandidates();
  }, [selectedCategoryFilter, candidates]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, candidatesData] = await Promise.all([
        getAllCategories(),
        getAllCandidates()
      ]);
      setCategories(categoriesData);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    if (selectedCategoryFilter === 'all') {
      setFilteredCandidates(candidates);
    } else {
      setFilteredCandidates(
        candidates.filter(c => c.categoryId === selectedCategoryFilter)
      );
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getCandidateCountForCategory = (categoryId: string): number => {
    return candidates.filter(c => c.categoryId === categoryId).length;
  };

  const handleOpenModal = (candidate?: Candidate) => {
    if (candidate) {
      setEditingCandidate(candidate);
      setFormData({
        name: candidate.name,
        categoryId: candidate.categoryId,
        photo: candidate.photo,
        description: candidate.description
      });
      setImagePreview(candidate.photo);
    } else {
      setEditingCandidate(null);
      setFormData({
        name: '',
        categoryId: preselectedCategoryId || '',
        photo: '',
        description: ''
      });
      setImagePreview('');
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCandidate(null);
    setFormData({ name: '', categoryId: '', photo: '', description: '' });
    setImagePreview('');
    setFormError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormError('Candidate name is required');
      return false;
    }
    if (formData.name.trim().length < 3) {
      setFormError('Candidate name must be at least 3 characters');
      return false;
    }
    if (!formData.categoryId) {
      setFormError('Please select a category');
      return false;
    }
    if (!formData.photo.trim()) {
      setFormError('Photo URL is required');
      return false;
    }
    
    // Basic URL validation
    try {
      new URL(formData.photo.trim());
    } catch {
      setFormError('Please enter a valid image URL');
      return false;
    }
    
    if (!formData.description.trim()) {
      setFormError('Description is required');
      return false;
    }

    // Check category limit (3 candidates max per category)
    if (!editingCandidate) {
      const countInCategory = getCandidateCountForCategory(formData.categoryId);
      if (countInCategory >= 3) {
        setFormError('This category already has 3 candidates (maximum limit)');
        return false;
      }
    }
    
    return true;
  };

  const handlePhotoUrlChange = (url: string) => {
    setFormData({ ...formData, photo: url });
    
    // Update preview if valid URL
    try {
      new URL(url.trim());
      setImagePreview(url.trim());
    } catch {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setFormError('');
    
    try {
      const candidateData = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        photo: formData.photo.trim(),
        description: formData.description.trim()
      };
      
      if (editingCandidate) {
        await updateCandidate(editingCandidate.id, candidateData);
      } else {
        await createCandidate(candidateData);
      }
      
      await loadData();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving candidate:', error);
      setFormError(error.message || 'Failed to save candidate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (candidate: Candidate) => {
    const categoryName = getCategoryName(candidate.categoryId);
    
    let confirmMessage = `Are you sure you want to delete "${candidate.name}" from "${categoryName}"?`;
    
    if (candidate.totalVotes > 0) {
      confirmMessage += `\n\n⚠️ WARNING: This candidate has ${candidate.totalVotes} vote(s). Deleting will affect voting results!`;
    }
    
    confirmMessage += '\n\nThis action cannot be undone.';
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;
    
    setDeleting(candidate.id);
    
    try {
      await deleteCandidate(candidate.id);
      await loadData();
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      alert(error.message || 'Failed to delete candidate');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: '#D4AF37' }}
          />
          <p className="mt-4" style={{ color: '#E8E8E8' }}>Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#D4AF37', letterSpacing: '0.02em' }}>
            Candidates Management
          </h1>
          <p className="mt-1" style={{ color: '#94A3B8' }}>
            Add and manage candidates for each category
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={categories.length === 0}
          className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: categories.length === 0 
              ? 'rgba(212, 175, 55, 0.5)' 
              : 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
            color: '#021210',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
            cursor: categories.length === 0 ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (categories.length > 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(212, 175, 55, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
          }}
        >
          <span className="text-xl">+</span>
          <span>New Candidate</span>
        </button>
      </div>

      {/* No Categories Warning */}
      {categories.length === 0 && (
        <div 
          className="rounded-xl p-6"
          style={{
            background: 'rgba(251, 146, 60, 0.1)',
            border: '1px solid rgba(251, 146, 60, 0.3)'
          }}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold mb-2" style={{ color: '#FB923C' }}>
                No Categories Available
              </h3>
              <p className="mb-4" style={{ color: '#FDBA74' }}>
                You need to create categories before adding candidates.
              </p>
              <Link
                href="/admin/categories"
                className="inline-block px-6 py-3 rounded-lg font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Create Categories First
              </Link>
            </div>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              className="rounded-xl shadow-md p-6"
              style={{ 
                background: 'rgba(4, 29, 26, 0.95)',
                borderLeft: '4px solid #D4AF37'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                    Total Candidates
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: '#E8E8E8' }}>
                    {candidates.length}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(212, 175, 55, 0.1)' }}
                >
                  <span className="text-3xl">👥</span>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl shadow-md p-6"
              style={{ 
                background: 'rgba(4, 29, 26, 0.95)',
                borderLeft: '4px solid #22C55E'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                    Complete Categories
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: '#E8E8E8' }}>
                    {categories.filter(c => getCandidateCountForCategory(c.id) === 3).length}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(34, 197, 94, 0.1)' }}
                >
                  <span className="text-3xl">✅</span>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl shadow-md p-6"
              style={{ 
                background: 'rgba(4, 29, 26, 0.95)',
                borderLeft: '4px solid #60A5FA'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                    Total Votes
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: '#E8E8E8' }}>
                    {candidates.reduce((sum, c) => sum + c.totalVotes, 0)}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(96, 165, 250, 0.1)' }}
                >
                  <span className="text-3xl">🗳️</span>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl shadow-md p-6"
              style={{ 
                background: 'rgba(4, 29, 26, 0.95)',
                borderLeft: '4px solid #FB923C'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                    Needs Candidates
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: '#E8E8E8' }}>
                    {categories.filter(c => getCandidateCountForCategory(c.id) < 3).length}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(251, 146, 60, 0.1)' }}
                >
                  <span className="text-3xl">⏳</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div 
            className="rounded-xl shadow-md p-6"
            style={{ 
              background: 'rgba(4, 29, 26, 0.95)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold" style={{ color: '#B8956D' }}>
                Filter by Category:
              </span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={selectedCategoryFilter === 'all' ? {
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                    color: '#021210',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  } : {
                    background: 'rgba(107, 114, 128, 0.3)',
                    color: '#E8E8E8',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategoryFilter !== 'all') {
                      e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategoryFilter !== 'all') {
                      e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)';
                    }
                  }}
                >
                  All ({candidates.length})
                </button>
                {categories.map((category) => {
                  const count = getCandidateCountForCategory(category.id);
                  const isActive = selectedCategoryFilter === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryFilter(category.id)}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={isActive ? {
                        background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                        color: '#021210',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                      } : {
                        background: 'rgba(107, 114, 128, 0.3)',
                        color: '#E8E8E8',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)';
                        }
                      }}
                    >
                      {category.name} ({count}/3)
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Candidates Grid/List */}
          {filteredCandidates.length === 0 ? (
            <div 
              className="rounded-xl shadow-md p-12 text-center"
              style={{ 
                background: 'rgba(4, 29, 26, 0.95)',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}
            >
              <div className="max-w-md mx-auto">
                <span className="text-6xl mb-4 block">👥</span>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#D4AF37' }}>
                  {selectedCategoryFilter === 'all' 
                    ? 'No Candidates Yet' 
                    : `No Candidates in "${getCategoryName(selectedCategoryFilter)}"`
                  }
                </h3>
                <p className="mb-6" style={{ color: '#94A3B8' }}>
                  Add candidates to start the voting process. Each category needs exactly 3 candidates.
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-6 py-3 rounded-lg font-semibold transition-all"
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
                  Add First Candidate
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-xl shadow-md overflow-hidden transition-all group"
                  style={{ 
                    background: 'rgba(4, 29, 26, 0.95)',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(212, 175, 55, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Candidate Image */}
                  <div className="relative h-64 bg-gray-700 overflow-hidden">
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                          color: '#021210'
                        }}
                      >
                        {getCategoryName(candidate.categoryId)}
                      </span>
                    </div>
                    {candidate.totalVotes > 0 && (
                      <div className="absolute bottom-3 left-3">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                          style={{ 
                            background: 'rgba(34, 197, 94, 0.9)',
                            color: 'white'
                          }}
                        >
                          <span>🗳️</span>
                          <span>{candidate.totalVotes} votes</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Candidate Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#E8E8E8' }}>
                      {candidate.name}
                    </h3>
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: '#94A3B8' }}>
                      {candidate.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(candidate)}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: 'rgba(96, 165, 250, 0.2)',
                          color: '#60A5FA',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(96, 165, 250, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(candidate)}
                        disabled={deleting === candidate.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#EF4444',
                          cursor: deleting === candidate.id ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (deleting !== candidate.id) {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        }}
                      >
                        {deleting === candidate.id ? (
                          <div 
                            className="animate-spin rounded-full h-4 w-4 border-b-2"
                            style={{ borderColor: '#EF4444' }}
                          />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div 
            className="rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ 
              background: 'rgba(4, 29, 26, 0.98)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            {/* Modal Header */}
            <div 
              className="px-6 py-4 flex justify-between items-center sticky top-0"
              style={{ 
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)'
              }}
            >
              <h2 className="text-xl font-bold" style={{ color: '#021210' }}>
                {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1 transition-all"
                style={{ 
                  background: 'rgba(2, 18, 16, 0.2)',
                  color: '#021210'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(2, 18, 16, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(2, 18, 16, 0.2)';
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div 
                  className="p-4 rounded-lg text-sm flex items-start gap-2"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <svg 
                    className="w-5 h-5 flex-shrink-0 mt-0.5" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    style={{ color: '#EF4444' }}
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span style={{ color: '#FCA5A5' }}>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#B8956D' }}
                    >
                      Candidate Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., John Doe"
                      className="w-full px-4 py-3 rounded-lg transition-all"
                      style={{
                        background: 'rgba(107, 114, 128, 0.2)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#E8E8E8',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      }}
                      maxLength={100}
                      required
                    />
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                      {formData.name.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#B8956D' }}
                    >
                      Category <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg transition-all"
                      style={{
                        background: 'rgba(107, 114, 128, 0.2)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#E8E8E8',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      }}
                      required
                    >
                      <option value="" style={{ background: '#041d1a', color: '#E8E8E8' }}>
                        Select a category
                      </option>
                      {categories.map((category) => {
                        const count = getCandidateCountForCategory(category.id);
                        const isDisabled = !editingCandidate && count >= 3;
                        return (
                          <option 
                            key={category.id} 
                            value={category.id}
                            disabled={isDisabled}
                            style={{ background: '#041d1a', color: isDisabled ? '#6B7280' : '#E8E8E8' }}
                          >
                            {category.name} ({count}/3) {isDisabled ? '- Full' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {formData.categoryId && (
                      <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                        {getCandidateCountForCategory(formData.categoryId)}/3 candidates in this category
                      </p>
                    )}
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#B8956D' }}
                    >
                      Photo URL <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.photo}
                      onChange={(e) => handlePhotoUrlChange(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 rounded-lg transition-all"
                      style={{
                        background: 'rgba(107, 114, 128, 0.2)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#E8E8E8',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      }}
                      required
                    />
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                      Use free image hosting:{' '}
                      <a 
                        href="https://imgur.com" 
                        target="_blank" 
                        className="hover:underline"
                        style={{ color: '#D4AF37' }}
                      >
                        Imgur
                      </a>
                      ,{' '}
                      <a 
                        href="https://imgbb.com" 
                        target="_blank" 
                        className="hover:underline"
                        style={{ color: '#D4AF37' }}
                      >
                        ImgBB
                      </a>
                      ,{' '}
                      <a 
                        href="https://postimages.org" 
                        target="_blank" 
                        className="hover:underline"
                        style={{ color: '#D4AF37' }}
                      >
                        PostImages
                      </a>
                    </p>
                  </div>
                </div>

                {/* Right Column - Image Preview */}
                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: '#B8956D' }}
                  >
                    Photo Preview
                  </label>
                  <div 
                    className="rounded-lg h-64 flex items-center justify-center overflow-hidden"
                    style={{
                      border: '2px dashed rgba(212, 175, 55, 0.3)',
                      background: 'rgba(107, 114, 128, 0.1)'
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Invalid+URL';
                        }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <svg 
                          className="w-16 h-16 mx-auto mb-2" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          style={{ color: '#6B7280' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm" style={{ color: '#94A3B8' }}>
                          Enter image URL to see preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description - Full Width */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#B8956D' }}
                >
                  Description <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description about the candidate..."
                  className="w-full px-4 py-3 rounded-lg h-32 resize-none transition-all"
                  style={{
                    background: 'rgba(107, 114, 128, 0.2)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#E8E8E8',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  }}
                  maxLength={500}
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Modal Footer */}
              <div 
                className="flex gap-3 pt-4"
                style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 rounded-lg font-medium transition-all"
                  style={{
                    background: 'rgba(107, 114, 128, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#E8E8E8',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(107, 114, 128, 0.3)';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: submitting 
                      ? 'rgba(212, 175, 55, 0.5)' 
                      : 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                    color: '#021210',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 25px rgba(212, 175, 55, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                  }}
                >
                  {submitting ? (
                    <>
                      <div 
                        className="animate-spin rounded-full h-5 w-5 border-b-2"
                        style={{ borderColor: '#021210' }}
                      />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCandidate ? 'Update Candidate' : 'Add Candidate'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
