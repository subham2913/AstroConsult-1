import { useState, useEffect } from 'react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, category: null });
  const [editModal, setEditModal] = useState({ show: false, category: null });
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get auth token from localStorage (adjust based on your auth implementation)
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API base URL
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async () => {
    console.log('Create category called'); // Debug log
    
    if (!newCategory.trim()) {
      setError('Please enter a category name');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const token = getAuthToken();
      console.log('Token:', token); // Debug log
      console.log('Creating category:', newCategory.trim()); // Debug log
      
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      console.log('Response status:', response.status); // Debug log
      
      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create category');
      }

      setCategories(prev => [data, ...prev]);
      setNewCategory('');
      setSuccess('Category created successfully!');
    } catch (err) {
      console.error('Create category error:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE}/categories/${deleteModal.category._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategories(prev => prev.filter(cat => cat._id !== deleteModal.category._id));
      setSuccess('Category deleted successfully!');
      setDeleteModal({ show: false, category: null });
    } catch (err) {
      setError('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async () => {
    console.log('Update category called'); // Debug log
    
    if (!editName.trim()) {
      setError('Please enter a category name');
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const token = getAuthToken();
      console.log('Updating category:', editModal.category._id, editName.trim()); // Debug log
      
      const response = await fetch(`${API_BASE}/categories/${editModal.category._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await response.json();
      console.log('Update response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update category');
      }

      setCategories(prev => prev.map(cat => 
        cat._id === editModal.category._id ? data : cat
      ));
      setSuccess('Category updated successfully!');
      setEditModal({ show: false, category: null });
      setEditName('');
    } catch (err) {
      console.error('Update category error:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show notifications
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createCategory();
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Category Management</h1>
          <p className="text-gray-600">Organize and manage your website categories</p>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Categories</h3>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {categories.length}
            </div>
          </div>
        </div>

        {/* Create Category Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Category</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter category name..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              maxLength="50"
              disabled={loading}
            />
            <button
              onClick={createCategory}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Category
                </>
              )}
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {loading && categories.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No categories yet</h3>
            <p className="text-gray-500">Create your first category to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 capitalize truncate">
                      {category.name}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditModal({ show: true, category });
                        setEditName(category.name);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, category })}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Delete Category</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.category?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, category: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={deleteCategory}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Category</h3>
            <div>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors mb-6"
                maxLength="50"
                disabled={loading}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditModal({ show: false, category: null });
                    setEditName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={updateCategory}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {(error || success) && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg text-white font-medium ${
            error ? 'bg-red-500' : 'bg-green-500'
          } animate-pulse`}>
            {error || success}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;