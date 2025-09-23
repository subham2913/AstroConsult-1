import { useState, useEffect } from 'react';

const SubcategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [groupedSubcategories, setGroupedSubcategories] = useState({});
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, subcategory: null });
  const [editModal, setEditModal] = useState({ show: false, subcategory: null });
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API base URL
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch subcategories
  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE}/subcategories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }

      const data = await response.json();
      setSubcategories(data);
      groupSubcategoriesByCategory(data);
    } catch (err) {
      setError('Failed to fetch subcategories');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group subcategories by category
  const groupSubcategoriesByCategory = (subcats) => {
    const grouped = {};
    subcats.forEach(subcat => {
      const categoryName = subcat.categoryId?.name || 'Unknown';
      const categoryId = subcat.categoryId?._id || 'unknown';
      
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          categoryName: categoryName,
          subcategories: []
        };
      }
      grouped[categoryId].subcategories.push(subcat);
    });
    setGroupedSubcategories(grouped);
  };

  // Create subcategory
  const createSubcategory = async () => {
    if (!newSubcategory.trim()) {
      setError('Please enter a subcategory name');
      return;
    }

    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE}/subcategories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newSubcategory.trim(),
          categoryId: selectedCategory 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create subcategory');
      }

      setSubcategories(prev => [data, ...prev]);
      groupSubcategoriesByCategory([data, ...subcategories]);
      setNewSubcategory('');
      setSuccess('Subcategory created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete subcategory
  const deleteSubcategory = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE}/subcategories/${deleteModal.subcategory._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete subcategory');
      }

      const updatedSubcategories = subcategories.filter(sub => sub._id !== deleteModal.subcategory._id);
      setSubcategories(updatedSubcategories);
      groupSubcategoriesByCategory(updatedSubcategories);
      setSuccess('Subcategory deleted successfully!');
      setDeleteModal({ show: false, subcategory: null });
    } catch (err) {
      setError('Failed to delete subcategory');
    } finally {
      setLoading(false);
    }
  };

  // Update subcategory
  const updateSubcategory = async () => {
    if (!editName.trim()) {
      setError('Please enter a subcategory name');
      return;
    }

    if (!editCategoryId) {
      setError('Please select a category');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE}/subcategories/${editModal.subcategory._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: editName.trim(),
          categoryId: editCategoryId 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update subcategory');
      }

      const updatedSubcategories = subcategories.map(sub => 
        sub._id === editModal.subcategory._id ? data : sub
      );
      setSubcategories(updatedSubcategories);
      groupSubcategoriesByCategory(updatedSubcategories);
      setSuccess('Subcategory updated successfully!');
      setEditModal({ show: false, subcategory: null });
      setEditName('');
      setEditCategoryId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createSubcategory();
    }
  };

  // Get filtered subcategories
  const getFilteredSubcategories = () => {
    if (filterCategory === 'all') {
      return groupedSubcategories;
    }
    
    const filtered = {};
    if (groupedSubcategories[filterCategory]) {
      filtered[filterCategory] = groupedSubcategories[filterCategory];
    }
    return filtered;
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

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const filteredSubcategories = getFilteredSubcategories();
  const totalSubcategories = subcategories.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Subcategory Management</h1>
          <p className="text-gray-600">Organize subcategories under their parent categories</p>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Categories</h3>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {categories.length}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Subcategories</h3>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {totalSubcategories}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Categories with Subcategories</h3>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                {Object.keys(groupedSubcategories).length}
              </div>
            </div>
          </div>
        </div>

        {/* Create Subcategory Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New Subcategory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
              disabled={loading}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter subcategory name..."
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
              maxLength="50"
              disabled={loading}
            />
            
            <button
              onClick={createSubcategory}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Subcategory
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">Subcategories</h2>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subcategories by Category */}
        {loading && subcategories.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : Object.keys(filteredSubcategories).length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No subcategories yet</h3>
            <p className="text-gray-500">Create your first subcategory to get started</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredSubcategories).map(([categoryId, { categoryName, subcategories: catSubcategories }]) => (
              <div key={categoryId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
                  <h3 className="text-xl font-bold text-white capitalize">{categoryName}</h3>
                  <p className="text-green-100">{catSubcategories.length} subcategories</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catSubcategories.map((subcategory) => (
                      <div key={subcategory._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-semibold text-gray-800 capitalize">
                            {subcategory.name}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {new Date(subcategory.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditModal({ show: true, subcategory });
                              setEditName(subcategory.name);
                              setEditCategoryId(subcategory.categoryId._id);
                            }}
                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteModal({ show: true, subcategory })}
                            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Delete Subcategory</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.subcategory?.name}" from "{deleteModal.subcategory?.categoryId?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, subcategory: null })}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={deleteSubcategory}
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Subcategory</h3>
            <div className="space-y-4">
              <select
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Subcategory name..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                maxLength="50"
                disabled={loading}
                autoFocus
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditModal({ show: false, subcategory: null });
                  setEditName('');
                  setEditCategoryId('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={updateSubcategory}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

export default SubcategoryManagement;