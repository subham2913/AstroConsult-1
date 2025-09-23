import { useState, useEffect } from 'react';
import PDFViewer from '../components/PDFViewer';
import { AddConsultationHistoryModal, ConsultationHistoryList } from '../components/AddConsultationHistoryModel';
import { useDataContext } from "../context/Data-context";
import { Editor } from 'primereact/editor';
import { useNavigate } from 'react-router-dom';
import DOMPurify from "dompurify";

// Header Component
const Header = ({ consultationsCount }) => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold text-gray-800 mb-2">Consultation Management</h1>
    <p className="text-gray-600">Manage astrological consultations and client records</p>
  </div>
);

// Statistics Component
const Statistics = ({ consultations }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Consultations</h3>
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {consultations.length}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
        <div className="text-3xl font-bold text-orange-600">
          {consultations.filter(c => c.status === 'pending').length}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">In Progress</h3>
        <div className="text-3xl font-bold text-blue-600">
          {consultations.filter(c => c.status === 'in-progress').length}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed</h3>
        <div className="text-3xl font-bold text-green-600">
          {consultations.filter(c => c.status === 'completed').length}
        </div>
      </div>
    </div>
  </div>
);

// Search and Filters Component - FIXED: Proper defaultValue usage
const SearchAndFilters = ({
  searchTerm, setSearchTerm, filterName, setFilterName, filterDOB, setFilterDOB,
  filterCategory, setFilterCategory, filterStatus, setFilterStatus,
  categories, clearFilters, onCreateClick
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search consultations..."
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
        />

        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="Filter by name..."
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
        />

        <input
          type="date"
          value={filterDOB}
          onChange={(e) => setFilterDOB(e.target.value)}
          placeholder="Filter by DOB"
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
        />

        {/* FIXED: Use value prop instead of selected on option */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* FIXED: Use value prop instead of selected on option */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate('/consultations/create')}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Consultation
        </button>
      </div>
    </div>
  );
};

// Consultations List Component
const ConsultationsList = ({ consultations, loading, onViewDetails }) => {
  const navigate = useNavigate();
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');

  if (loading && consultations.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-lg">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5V7a1 1 0 00-1-1H7a1 1 0 00-1 1v4.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5V5z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No consultations found</h3>
        <p className="text-gray-500">Create your first consultation to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Name</th>
              <th className="px-6 py-4 text-left font-semibold">Date of Birth</th>
              <th className="px-6 py-4 text-left font-semibold">Phone</th>
              <th className="px-6 py-4 text-left font-semibold">Place of Birth</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Categories</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {consultations.map((consultation) => (
              <tr key={consultation._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                  {consultation.name}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {formatDate(consultation.dateOfBirth)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {consultation.phone}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {consultation.placeOfBirth}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                      consultation.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                    }`}>
                    {consultation.status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {consultation.categories?.map(category => (
                      <span key={category._id} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewDetails(consultation)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Consultation Form Component - FIXED: Select elements use value prop


const ConsultationForm = ({
  formDataInit = {
    name: "",
    dateOfBirth: "",
    timeOfBirth: "",
    placeOfBirth: "",
    phone: "",
    email: "",
    fatherName: "",
    motherName: "",
    grandfatherName: "",
    address: "",
    pincode: "",
    consultationDate: new Date().toISOString().split("T")[0],
    planetaryPositions: "",
    prediction: "",
    suggestions: "",
    categories: [],
    status: "pending",
  },
  categories = [],
  kundaliFile,               // existing uploaded file name, for edit
  onFileChange,              // callback for file input change (file upload)
  onInputChange,             // callback for input change (send event)
  onCategoryChange,          // callback for toggling category checkbox (send category id)
  onSubmit,                  // callback when form submitted
  onCancel,                  // callback to cancel / go back
  loading = false,           // loading state to disable buttons
  submitLabel = "Submit",    // submit button label
  setError,                  // callback to set error messages
}) => {
  const [formData, setFormData] = useState(formDataInit);
  const [file, setFile] = useState(null);

  useEffect(() => {
    setFormData(formDataInit);
    setFile(null); // reset if formDataInit changes
  }, [formDataInit]);

  // Internal handler for inputs to update local state & propagate up
  const handleInputChangeInternal = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (onInputChange) onInputChange(e);
  };

  // Handler for category toggle
  const handleCategoryChangeInternal = (categoryId) => {
    setFormData((prev) => {
      const categoriesSet = new Set(prev.categories);
      if (categoriesSet.has(categoryId)) {
        categoriesSet.delete(categoryId);
      } else {
        categoriesSet.add(categoryId);
      }
      const updatedCategories = Array.from(categoriesSet);
      const mockEvent = { target: { name: "categories", value: updatedCategories } };
      if (onInputChange) onInputChange(mockEvent);
      if (onCategoryChange) onCategoryChange(categoryId);
      return { ...prev, categories: updatedCategories };
    });
  };

  // Handler for file input changes
  const handleFileChangeInternal = (e) => {
    const fileSelected = e.target.files?.[0];
    if (!fileSelected || fileSelected.type !== "application/pdf") {
      if (setError) setError("Please select a valid PDF file");
      return;
    }
    setFile(fileSelected);
    if (onFileChange) onFileChange(e);
  };

  // Handlers for rich text editors
  const handleEditorChange = (field) => (e) => {
    const value = e.htmlValue;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Propagate as synthetic event to onInputChange for consistency
    if (onInputChange) onInputChange({ target: { name: field, value } });
  };

  // Form submission handler
  const handleSubmitInternal = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmitInternal} className="p-6 space-y-6">
      {/* Personal Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Personal Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChangeInternal}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
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
              onChange={handleInputChangeInternal}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
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
              onChange={handleInputChangeInternal}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
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
              onChange={handleInputChangeInternal}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
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
              onChange={handleInputChangeInternal}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChangeInternal}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Family Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Family Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleInputChangeInternal}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleInputChangeInternal}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grandfather's Name</label>
            <input
              type="text"
              name="grandfatherName"
              value={formData.grandfatherName}
              onChange={handleInputChangeInternal}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Address Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChangeInternal}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChangeInternal}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Consultation Details */}
      <div > 
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Consultation Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Date</label>
              <input
                type="date"
                name="consultationDate"
                value={formData.consultationDate}
                onChange={handleInputChangeInternal}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChangeInternal}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Rich Text Editors */}
          <div className="my-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Planetary Positions</label>
              <div className="border border-gray-300 rounded focus-within:border-purple-500">
                <Editor
                  value={formData.planetaryPositions}
                  onTextChange={handleEditorChange("planetaryPositions")}
                  style={{ height: "150px" }}
                  placeholder="Enter planetary positions..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prediction</label>
              <div className="border border-gray-300 rounded focus-within:border-purple-500">
                <Editor
                  value={formData.prediction}
                  onTextChange={handleEditorChange("prediction")}
                  style={{ height: "150px" }}
                  placeholder="Enter prediction..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suggestions</label>
              <div className="border border-gray-300 rounded focus-within:border-purple-500">
                <Editor
                  value={formData.suggestions}
                  onTextChange={handleEditorChange("suggestions")}
                  style={{ height: "150px" }}
                  placeholder="Enter suggestions..."
                />
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* File Upload */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Kundali Upload</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Kundali PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChangeInternal}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
          />
          {!file && kundaliFile && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">Current file: <strong>{kundaliFile}</strong></p>
              <p className="text-blue-600 mt-1 text-xs">Upload a new file to replace the current one</p>
            </div>
          )}
          {file && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800 font-medium">{file.name}</p>
              <p className="text-green-600 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.categories.includes(cat._id)}
                onChange={() => handleCategoryChangeInternal(cat._id)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>{submitLabel}</>
          )}
        </button>
      </div>
    </form>
  );
};



// Main Consultation Management Component
const ConsultationManagement = () => {
  const [consultations, setConsultations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDOB, setFilterDOB] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem('token');

  // Fetch consultations from backend
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      // FIXED: Add proper authentication check
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filterCategory) queryParams.append('category', filterCategory);
      if (filterDOB) queryParams.append('dob', filterDOB);
      if (filterName) queryParams.append('name', filterName);
      if (filterStatus) queryParams.append('status', filterStatus);

      const url = `${API_BASE}/consultations?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // FIXED: Better error handling for 403 errors
      if (response.status === 403) {
        setError('Access denied. You may not have permission to view consultations or your session may have expired.');
        // Optionally redirect to login
        // window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.msg || 'Failed to fetch consultations');
      }

      const data = await response.json();
      setConsultations(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch consultations');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        console.warn('No auth token available for fetching categories');
        return;
      }

      const response = await fetch(`${API_BASE}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || data);
      } else if (response.status === 403) {
        console.warn('Access denied when fetching categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // FIXED: Better error handling for consultation details
  const showConsultationDetails = async (consultation) => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(`${API_BASE}/consultations/details/${consultation._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403) {
        setError('Access denied. You may not have permission to view this consultation.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setSelectedConsultation(data);
        setShowDetailModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.msg || 'Failed to fetch consultation details');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch consultation details');
    } finally {
      setLoading(false);
    }
  };

  // Handle consultation update
  const handleConsultationUpdate = (updatedConsultation) => {
    setConsultations(prev =>
      prev.map(c => c._id === updatedConsultation._id ? updatedConsultation : c)
    );
    setSelectedConsultation(updatedConsultation);
    setSuccess('Consultation updated successfully!');
  };

  // Handle consultation deletion
  const handleConsultationDelete = (deletedId) => {
    setConsultations(prev => prev.filter(c => c._id !== deletedId));
    setShowDetailModal(false);
    setSelectedConsultation(null);
    setSuccess('Consultation deleted successfully!');
  };

  // Handle consultation creation
  const handleConsultationCreate = (newConsultation) => {
    setConsultations(prev => [newConsultation, ...prev]);
    setSuccess('Consultation created successfully!');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterDOB('');
    setFilterName('');
    setFilterStatus('');
    fetchConsultations();
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
    fetchConsultations();
    fetchCategories();
  }, []);

  // Auto-search when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchConsultations();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterCategory, filterDOB, filterName, filterStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header consultationsCount={consultations.length} />
        <Statistics consultations={consultations} />
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterName={filterName}
          setFilterName={setFilterName}
          filterDOB={filterDOB}
          setFilterDOB={setFilterDOB}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          categories={categories}
          clearFilters={clearFilters}
          onCreateClick={() => setShowCreateModal(true)}
        />
        <ConsultationsList
          consultations={consultations}
          loading={loading}
          onViewDetails={showConsultationDetails}
        />

        {/* Create Modal */}
        {showCreateModal && (
          <CreateConsultationModal
            categories={categories}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleConsultationCreate}
            setError={setError}
            setLoading={setLoading}
          />
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedConsultation && (
          <ConsultationDetailModal
            consultation={selectedConsultation}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedConsultation(null);
            }}
            onEdit={() => {
              setShowDetailModal(false);
              setShowEditModal(true);
            }}
            onDelete={handleConsultationDelete}
            setError={setError}
            setLoading={setLoading}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedConsultation && (
          <EditConsultationModal
            consultation={selectedConsultation}
            categories={categories}
            onClose={() => {
              setShowEditModal(false);
              setShowDetailModal(true);
            }}
            onSuccess={handleConsultationUpdate}
            setError={setError}
            setLoading={setLoading}
          />
        )}

        <ToastNotification error={error} success={success} />
      </div>
    </div>
  );
};

// Create Consultation Modal
const CreateConsultationModal = ({ categories, onClose, onSuccess, setError, setLoading }) => {
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
    status: 'pending'
  });

  const [kundaliFile, setKundaliFile] = useState(null);
  const [loading, setLocalLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem('token');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setKundaliFile(file);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const createConsultation = async () => {
    try {
      const requiredFields = ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'phone'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      setLocalLoading(true);
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setError('Authentication required. Please log in.');
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
        },
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. You may not have permission to create consultations.');
        }
        throw new Error(data.msg || 'Failed to create consultation');
      }

      onSuccess(data.data || data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-800">Create New Consultation</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <ConsultationForm
          formData={formData}
          categories={categories}
          kundaliFile={kundaliFile}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onFileChange={handleFileChange}
          onSubmit={createConsultation}
          onCancel={onClose}
          loading={loading}
          submitLabel="Create Consultation"
        />
      </div>
    </div>
  );
};

// Consultation Detail Modal
const ConsultationDetailModal = ({ consultation, onClose, onEdit, onDelete, setError, setLoading }) => {
  const [loading, setLocalLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Consultation History States
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'history'

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem('token');

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');

  // Fetch consultation history
  const fetchConsultationHistory = async () => {
    try {
      setHistoryLoading(true);
      const token = getAuthToken();

      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(`${API_BASE}/consultation-history/consultation/${consultation._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConsultationHistory(data.data || []);
      } else if (response.status === 403) {
        console.error('Access denied when fetching consultation history');
      } else {
        console.error('Failed to fetch consultation history');
      }
    } catch (err) {
      console.error('Error fetching consultation history:', err);
      setError('Failed to fetch consultation history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle adding new consultation history
  const handleHistoryAdd = (newHistory) => {
    setConsultationHistory(prev => [newHistory, ...prev]);
    setError('');
  };

  // Handle deleting consultation history
  const handleHistoryDelete = async (historyEntry) => {
    if (!window.confirm('Are you sure you want to delete this consultation history entry?')) {
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(`${API_BASE}/consultation-history/${historyEntry._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setConsultationHistory(prev => prev.filter(h => h._id !== historyEntry._id));
      } else if (response.status === 403) {
        throw new Error('Access denied. You may not have permission to delete this history entry.');
      } else {
        throw new Error('Failed to delete consultation history');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing consultation history
  const handleHistoryEdit = (historyEntry) => {
    console.log('Edit history entry:', historyEntry);
  };

  // Delete main consultation
  const handleDelete = async () => {
    try {
      setLocalLoading(true);
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const response = await fetch(`${API_BASE}/consultations/${consultation._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          throw new Error('Access denied. You may not have permission to delete this consultation.');
        }
        throw new Error(data.msg || 'Failed to delete consultation');
      }

      onDelete(consultation._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLocalLoading(false);
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Fetch history when component mounts or consultation changes
  useEffect(() => {
    if (consultation._id) {
      fetchConsultationHistory();
    }
  }, [consultation._id]);

  // Toggle full screen mode
  const toggleFullScreen = () => {
    setShowFullScreen(!showFullScreen);
  };

  const modalClasses = showFullScreen
    ? "fixed inset-0 bg-white z-50 overflow-y-auto"
    : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto";

  const contentClasses = showFullScreen
    ? "w-full h-full flex flex-col"
    : "bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-screen overflow-y-auto";

  return (
    <div className={`${modalClasses} bg-gradient-to-r from-purple-500 to-purple-800`}>
  <div className={contentClasses}>
   <div>
      <div className={modalClasses}>
        <div className={contentClasses}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Consultation Details - {consultation.name}
                </h3>

                {/* Tab Navigation */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'details'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    History ({consultationHistory.length})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Full Screen Toggle */}
                <button
                  onClick={toggleFullScreen}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={showFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {showFullScreen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a2 2 0 012-2h4M4 16v4a2 2 0 002 2h4m8-8V4a2 2 0 00-2-2h-4m4 12v4a2 2 0 01-2 2h-4" />
                    </svg>
                  )}
                </button>

                {/* Action Buttons */}
                <button
                  onClick={onEdit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>

                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <p className="text-gray-600 capitalize">{consultation.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date of Birth:</span>
                      <p className="text-gray-600">{formatDate(consultation.dateOfBirth)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Time of Birth:</span>
                      <p className="text-gray-600">{consultation.timeOfBirth}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Place of Birth:</span>
                      <p className="text-gray-600">{consultation.placeOfBirth}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-600">{consultation.phone}</p>
                    </div>
                    {consultation.email && (
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-600">{consultation.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kundali PDF Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Kundali Document</h4>
                  <PDFViewer consultation={consultation} />
                </div>

                {/* Original Consultation Information */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Initial Consultation Information</h4>
                    <button
                      onClick={() => setShowAddHistoryModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add New Consultation
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="font-medium text-gray-700">Consultation Date:</span>
                      <p className="text-gray-600">{formatDate(consultation.consultationDate || consultation.createdAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          consultation.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                        }`}>
                        {consultation.status || 'pending'}
                      </span>
                    </div>
                  </div>

                  {consultation.planetaryPositions && (
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Planetary Positions:</span>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: consultation.planetaryPositions }} />
                      </div>
                    </div>
                  )}

                  {consultation.prediction && (
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Prediction:</span>
                      <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                        <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: consultation.prediction }} />
                      </div>
                    </div>
                  )}

                  {consultation.suggestions && (
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Suggestions:</span>
                      <div className="mt-2 p-4 bg-green-50 rounded-lg">
                        <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: consultation.suggestions }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {consultation.categories && consultation.categories.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {consultation.categories.map(category => (
                        <span key={category._id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-800">Consultation History</h4>
                  <button
                    onClick={() => setShowAddHistoryModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Consultation
                  </button>
                </div>

                <ConsultationHistoryList
                  consultationHistory={consultationHistory}
                  loading={historyLoading}
                  onEdit={handleHistoryEdit}
                  onDelete={handleHistoryDelete}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add History Modal */}
      {showAddHistoryModal && (
        <AddConsultationHistoryModal
          consultationId={consultation._id}
          onClose={() => setShowAddHistoryModal(false)}
          onSuccess={handleHistoryAdd}
          setError={setError}
          setLoading={setLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Delete Consultation</h3>
                  <p className="text-gray-600">Are you sure you want to delete this consultation?</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  This action cannot be undone. All data related to <strong>{consultation.name}</strong>'s consultation and its history will be permanently deleted.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Delete Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

   
  );
};

// Edit Consultation Modal
const EditConsultationModal = ({ consultation, categories, onClose, onSuccess, setError, setLoading }) => {
  const { updatedConsultation } = useDataContext();

  const [formData, setFormData] = useState({
    name: consultation.name || '',
    dateOfBirth: consultation.dateOfBirth ? consultation.dateOfBirth.split('T')[0] : '',
    timeOfBirth: consultation.timeOfBirth || '',
    placeOfBirth: consultation.placeOfBirth || '',
    phone: consultation.phone || '',
    email: consultation.email || '',
    fatherName: consultation.fatherName || '',
    motherName: consultation.motherName || '',
    grandfatherName: consultation.grandfatherName || '',
    address: consultation.address || '',
    pincode: consultation.pincode || '',
    consultationDate: consultation.consultationDate ? consultation.consultationDate.split('T')[0] : new Date().toISOString().split('T')[0],
    planetaryPositions: consultation.planetaryPositions || '',
    prediction: consultation.prediction || '',
    suggestions: consultation.suggestions || '',
    categories: consultation.categories?.map(cat => cat._id) || [],
    status: consultation.status || 'pending'
  });

  const [kundaliFile, setKundaliFile] = useState(null);
  const [loading, setLocalLoading] = useState(false);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem('token');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setKundaliFile(file);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const updateConsultationData = async () => {
    try {
      const requiredFields = ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'phone'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      setLocalLoading(true);
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      const formDataObj = new FormData();
      formDataObj.append('consultationData', JSON.stringify(formData));

      if (kundaliFile) {
        formDataObj.append('kundaliPdf', kundaliFile);
      }

      const response = await fetch(`${API_BASE}/consultations/${consultation._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. You may not have permission to update this consultation.');
        }
        throw new Error(data.msg || 'Failed to update consultation');
      }

      onSuccess(data.data || data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-800">Edit Consultation</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <ConsultationForm
          formData={formData}
          categories={categories}
          kundaliFile={kundaliFile}
          existingFile={consultation.kundaliPdfName}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onFileChange={handleFileChange}
          onSubmit={updateConsultationData}
          onCancel={onClose}
          loading={loading}
          submitLabel="Update Consultation"
        />
      </div>
    </div>
  );
};

// Toast Notification Component
const ToastNotification = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-6 py-4 rounded-lg shadow-lg text-white font-medium ${error ? 'bg-red-500' : 'bg-green-500'
        }`}>
        {error || success}
      </div>
    </div>
  );
};



export default ConsultationManagement;