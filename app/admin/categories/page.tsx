'use client';

import { useEffect, useState } from 'react';
import { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCandidateCount 
} from '@/lib/services/adminService';
import { Category } from '@/lib/types/voting';

interface CategoryWithStats extends Category {
  candidateCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 1
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      
      // Load candidate counts for each category
      const categoriesWithStats = await Promise.all(
        data.map(async (cat) => ({
          ...cat,
          candidateCount: await getCandidateCount(cat.id)
        }))
      );
      
      setCategories(categoriesWithStats);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        order: category.order
      });
    } else {
      setEditingCategory(null);
      // Auto-set order to next available number
      const maxOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.order)) 
        : 0;
      setFormData({
        name: '',
        description: '',
        order: maxOrder + 1
      });
    }
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', order: 1 });
    setFormError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormError('Category name is required');
      return false;
    }
    if (formData.name.trim().length < 3) {
      setFormError('Category name must be at least 3 characters');
      return false;
    }
    if (!formData.description.trim()) {
      setFormError('Description is required');
      return false;
    }
    if (formData.order < 1) {
      setFormError('Order must be at least 1');
      return false;
    }
    
    // Check for duplicate names (excluding current editing category)
    const duplicateName = categories.find(
      cat => cat.name.toLowerCase() === formData.name.trim().toLowerCase() 
        && cat.id !== editingCategory?.id
    );
    if (duplicateName) {
      setFormError('A category with this name already exists');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setFormError('');
    
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        order: formData.order
      };
      
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, categoryData);
      } else {
        // Create new category
        await createCategory(categoryData);
      }
      
      await loadCategories();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving category:', error);
      setFormError(error.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: CategoryWithStats) => {
    if (category.candidateCount && category.candidateCount > 0) {
      alert(`Cannot delete "${category.name}". It has ${category.candidateCount} candidate(s). Please delete all candidates first.`);
      return;
    }
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setDeleting(category.id);
    
    try {
      await deleteCategory(category.id);
      await loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.message || 'Failed to delete category');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (candidateCount?: number) => {
    if (!candidateCount || candidateCount === 0) {
      return (
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444'
          }}
        >
          <span>⚠️</span>
          <span>Empty</span>
        </span>
      );
    }
    if (candidateCount < 3) {
      return (
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
          style={{ 
            background: 'rgba(251, 146, 60, 0.1)',
            color: '#FB923C'
          }}
        >
          <span>⏳</span>
          <span>Incomplete</span>
        </span>
      );
    }
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
        style={{ 
          background: 'rgba(34, 197, 94, 0.1)',
          color: '#22C55E'
        }}
      >
        <span>✓</span>
        <span>Ready</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: '#D4AF37' }}
          />
          <p className="mt-4" style={{ color: '#E8E8E8' }}>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#D4AF37', letterSpacing: '0.02em' }}>
            Categories Management
          </h1>
          <p className="mt-1" style={{ color: '#94A3B8' }}>
            Create and manage voting categories
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
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
          <span className="text-xl">+</span>
          <span>New Category</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Total Categories
              </p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#E8E8E8' }}>
                {categories.length}
              </p>
            </div>
            <div 
              className="p-3 rounded-lg"
              style={{ background: 'rgba(212, 175, 55, 0.1)' }}
            >
              <span className="text-3xl">📁</span>
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
                {categories.filter(c => c.candidateCount === 3).length}
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
            borderLeft: '4px solid #FB923C'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
                Needs Attention
              </p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#E8E8E8' }}>
                {categories.filter(c => !c.candidateCount || c.candidateCount < 3).length}
              </p>
            </div>
            <div 
              className="p-3 rounded-lg"
              style={{ background: 'rgba(251, 146, 60, 0.1)' }}
            >
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div 
          className="rounded-xl shadow-md p-12 text-center"
          style={{ 
            background: 'rgba(4, 29, 26, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
        >
          <div className="max-w-md mx-auto">
            <span className="text-6xl mb-4 block">📁</span>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#D4AF37' }}>
              No Categories Yet
            </h3>
            <p className="mb-6" style={{ color: '#94A3B8' }}>
              Create your first category to start organizing the voting system.
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
              Create First Category
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="rounded-xl shadow-md overflow-hidden"
          style={{ 
            background: 'rgba(4, 29, 26, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead 
                style={{ 
                  background: 'rgba(107, 114, 128, 0.2)',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#B8956D' }}
                  >
                    Order
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#B8956D' }}
                  >
                    Category Name
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#B8956D' }}
                  >
                    Description
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#B8956D' }}
                  >
                    Candidates
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#B8956D' }}
                  >
                    Status
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#B8956D' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr 
                    key={category.id}
                    className="transition-all"
                    style={{ 
                      borderBottom: index < categories.length - 1 ? '1px solid rgba(212, 175, 55, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                        style={{ 
                          background: 'rgba(212, 175, 55, 0.1)',
                          color: '#D4AF37'
                        }}
                      >
                        {category.order}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold" style={{ color: '#E8E8E8' }}>
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm max-w-md" style={{ color: '#94A3B8' }}>
                        {category.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-lg font-bold"
                          style={{
                            color: category.candidateCount === 3 ? '#22C55E' : 
                                   category.candidateCount === 0 ? '#EF4444' : 
                                   '#FB923C'
                          }}
                        >
                          {category.candidateCount || 0}
                        </span>
                        <span style={{ color: '#94A3B8' }}>/</span>
                        <span style={{ color: '#94A3B8' }}>3</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(category.candidateCount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.location.href = `/admin/candidates?category=${category.id}`}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{
                            background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                            color: '#021210',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          Manage Candidates
                        </button>
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 rounded-lg transition-all"
                          title="Edit"
                          style={{ color: '#60A5FA' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          disabled={deleting === category.id}
                          className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                          style={{ color: '#EF4444' }}
                          onMouseEnter={(e) => {
                            if (deleting !== category.id) {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {deleting === category.id ? (
                            <div 
                              className="animate-spin rounded-full h-5 w-5 border-b-2"
                              style={{ borderColor: '#EF4444' }}
                            />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div 
            className="rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            style={{ 
              background: 'rgba(4, 29, 26, 0.98)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            {/* Modal Header */}
            <div 
              className="px-6 py-4 flex justify-between items-center"
              style={{ 
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)'
              }}
            >
              <h2 className="text-xl font-bold" style={{ color: '#021210' }}>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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

              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#B8956D' }}
                >
                  Category Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Best Leadership"
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
                  Description <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this category represents..."
                  className="w-full px-4 py-3 rounded-lg h-24 resize-none transition-all"
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
                  maxLength={300}
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                  {formData.description.length}/300 characters
                </p>
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#B8956D' }}
                >
                  Display Order <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
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
                  Categories will be displayed in this order during voting
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
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
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
