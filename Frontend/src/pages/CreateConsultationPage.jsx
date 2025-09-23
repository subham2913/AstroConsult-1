import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from 'primereact/editor';

const CreateConsultationPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    phone: '',
    email: '',
    fatherName: '',
    motherName: '',
    grandfatherName: '',
    address: '',
    pincode: '',
    consultationDate: new Date().toISOString().split('T')[0],
    planetaryPositions: '',
    prediction: '',
    suggestions: '',
    categories: [],
    status: 'pending',
  });

  const [categories, setCategories] = useState([]);
  const [kundaliFile, setKundaliFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setKundaliFile(file);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const createConsultation = async (e) => {
    e.preventDefault();

    const requiredFields = ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();

      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      const formDataObj = new FormData();
      formDataObj.append('consultationData', JSON.stringify(formData));

      if (kundaliFile) {
        formDataObj.append('kundaliPdf', kundaliFile);
      }

      const response = await fetch(`${API_BASE}/consultations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: do NOT set Content-Type here; browser sets correct multipart/form-data boundary when sending FormData
        },
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create consultation');
      }

      setSuccess('Consultation created successfully! Redirecting...');

      setTimeout(() => {
        navigate('/consultations');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/consultations');
  };

  // Custom toolbar for the editors (optional)
  const editorHeader = (
    <span className="ql-formats">
      <select className="ql-size">
        <option value="small">Small</option>
        <option selected>Normal</option>
        <option value="large">Large</option>
      </select>
      <button className="ql-bold" aria-label="Bold"></button>
      <button className="ql-italic" aria-label="Italic"></button>
      <button className="ql-underline" aria-label="Underline"></button>
      <select className="ql-color">
        <option selected></option>
        <option value="red"></option>
        <option value="orange"></option>
        <option value="yellow"></option>
        <option value="green"></option>
        <option value="blue"></option>
        <option value="purple"></option>
      </select>
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
      <button className="ql-clean"></button>
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                aria-label="Back to Consultations"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Consultations
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-semibold text-gray-800">Create New Consultation</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={createConsultation}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                type="submit"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Consultation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={createConsultation} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Personal Details Section */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="timeOfBirth"
                  value={formData.timeOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Family Details Section */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Family Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grandfather's Name</label>
                <input
                  type="text"
                  name="grandfatherName"
                  value={formData.grandfatherName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Address Details Section */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Address Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center gap-3">
              Categories (Optional)
              {categoriesLoading && (
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h3>
            
            {categoriesLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading categories...</div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-500 mb-2">No categories available</div>
                <div className="text-sm text-gray-400">Categories can be managed from the Category Management page</div>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Select applicable categories for this consultation ({formData.categories.length} selected)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map(category => (
                    <label 
                      key={category._id} 
                      className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category._id)}
                        onChange={() => handleCategoryChange(category._id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 font-medium capitalize group-hover:text-purple-700 transition-colors">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Consultation Details Section */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Consultation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Date</label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Rich Text Editors */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Planetary Positions</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-purple-500">
                  <Editor
                    value={formData.planetaryPositions}
                    onTextChange={(e) => handleInputChange({ target: { name: 'planetaryPositions', value: e.htmlValue } })}
                    headerTemplate={editorHeader}
                    style={{ height: '200px' }}
                    placeholder="Enter planetary positions..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Prediction</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-purple-500">
                  <Editor
                    value={formData.prediction}
                    onTextChange={(e) => handleInputChange({ target: { name: 'prediction', value: e.htmlValue } })}
                    headerTemplate={editorHeader}
                    style={{ height: '200px' }}
                    placeholder="Enter prediction..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Suggestions</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-purple-500">
                  <Editor
                    value={formData.suggestions}
                    onTextChange={(e) => handleInputChange({ target: { name: 'suggestions', value: e.htmlValue } })}
                    headerTemplate={editorHeader}
                    style={{ height: '200px' }}
                    placeholder="Enter suggestions..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* File Upload Section */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Kundali Upload</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Kundali PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {kundaliFile && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800">{kundaliFile.name}</p>
                      <p className="text-sm text-green-600">
                        {(kundaliFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document • Ready to upload
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default CreateConsultationPage;