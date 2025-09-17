import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from 'primereact/editor';
import DOMPurify from "dompurify";

// Add New Consultation History Modal
export const AddConsultationHistoryModal = ({ consultationId, onClose, onSuccess, setError, setLoading }) => {
  const [formData, setFormData] = useState({
    consultationDate: new Date().toISOString().split('T')[0],
    planetaryPositions: '',
    prediction: '',
    suggestions: '',
    sessionNotes: '',
    categories: [],
    status: 'completed'
  });

  const [loading, setLocalLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const API_BASE = 'http://localhost:5000/api';
  const getAuthToken = () => localStorage.getItem('token');

  // Fetch categories on component mount
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

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
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.consultationDate || !formData.planetaryPositions || !formData.prediction || !formData.suggestions) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLocalLoading(true);
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}/consultation-history/consultation/${consultationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to add consultation history');
      }

      onSuccess(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-800">Add New Consultation</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="consultationDate"
                value={formData.consultationDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              Categories (Optional)
              {categoriesLoading && (
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </label>
            
            {categoriesLoading ? (
              <div className="flex justify-center items-center py-6 bg-gray-50 rounded-lg">
                <div className="text-gray-500 text-sm">Loading categories...</div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-500 text-sm mb-1">No categories available</div>
                <div className="text-xs text-gray-400">Categories can be managed from the Category Management page</div>
              </div>
            ) : (
              <>
                <div className="mb-3 text-xs text-gray-600">
                  Select applicable categories for this consultation ({formData.categories.length} selected)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map(category => (
                    <label 
                      key={category._id} 
                      className="flex items-center space-x-2 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category._id)}
                        onChange={() => handleCategoryChange(category._id)}
                        className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-1"
                      />
                      <span className="text-gray-700 font-medium capitalize group-hover:text-purple-700 transition-colors">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planetary Positions <span className="text-red-500">*</span>
            </label>
            <Editor
              value={formData.planetaryPositions}
              onTextChange={(e) =>
                setFormData((prev) => ({ ...prev, planetaryPositions: e.htmlValue }))
              }
              style={{ height: "150px" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prediction <span className="text-red-500">*</span>
            </label>
            <Editor
              value={formData.prediction}
              onTextChange={(e) =>
                setFormData((prev) => ({ ...prev, prediction: e.htmlValue }))
              }
              style={{ height: "150px" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggestions <span className="text-red-500">*</span>
            </label>
            <Editor
              value={formData.suggestions}
              onTextChange={(e) =>
                setFormData((prev) => ({ ...prev, suggestions: e.htmlValue }))
              }
              style={{ height: "150px" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes</label>
            <textarea
              name="sessionNotes"
              value={formData.sessionNotes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Additional notes for this consultation session..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="sticky bottom-0 bg-white border-t pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Consultation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Updated Consultation History List Component with Categories Display
export const ConsultationHistoryList = ({ consultationHistory, loading, onDelete }) => {
  const navigate = useNavigate();
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');
  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading && consultationHistory.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (consultationHistory.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5V7a1 1 0 00-1-1H7a1 1 0 00-1 1v4.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5V5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No consultation history</h3>
        <p className="text-gray-500">
          Add the first consultation session to start building history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {consultationHistory.map((history, index) => {
        // Calculate reverse index so latest consultation shows as #1
        const displayIndex = consultationHistory.length - index;
        
        return (
          <div
            key={history._id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center group"
          >
            {/* Card body - clicking here navigates to the detail page */}
            <div
              className="flex-1 cursor-pointer"
              title="View Full Consultation History"
              onClick={() => navigate(`/consultation-history/${history._id}`)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">{displayIndex}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    Consultation - {formatDate(history.consultationDate)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatTime(history.consultationDate)} • {formatDate(history.createdAt)}
                  </p>
                </div>
                {/* Latest indicator for the most recent consultation */}
                {index === 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Latest
                  </span>
                )}
              </div>

              {/* Categories Display */}
              {history.categories && history.categories.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-600">Categories:</span>
                    {history.categories.map((category) => (
                      <span
                        key={category._id || category}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {typeof category === 'object' ? category.name : category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Planetary Positions</h5>
                  <div
                    className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 line-clamp-3 prose"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(history.planetaryPositions || ""),
                    }}
                  />
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Prediction</h5>
                  <div
                    className="bg-blue-50 rounded-lg p-3 text-sm text-gray-600 line-clamp-3 prose"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(history.prediction || ""),
                    }}
                  />
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Suggestions</h5>
                  <div
                    className="bg-green-50 rounded-lg p-3 text-sm text-gray-600 line-clamp-3 prose"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(history.suggestions || ""),
                    }}
                  />
                </div>
              </div>
              {history.sessionNotes && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">Session Notes</h5>
                  <div className="bg-yellow-50 rounded-lg p-3 text-sm text-gray-600">
                    {history.sessionNotes}
                  </div>
                </div>
              )}
            </div>
            {/* Action Buttons: Edit, Delete */}
            <div className="flex flex-col items-end gap-2 ml-4 mt-4 md:mt-0">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  history.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : history.status === "in-progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {history.status}
              </span>
              <button
                onClick={() => navigate(`/consultation-history/${history._id}/edit`)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit"
                type="button"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete(history)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
                type="button"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )})}
    </div>
  );
};