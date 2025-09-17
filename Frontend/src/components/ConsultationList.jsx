import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

// Import the service functions from your consultationService.js
import { 
  getMyConsultations, 
  getConsultationById, 
  deleteConsultation,
  viewConsultationPDF,
  downloadConsultationPDF 
} from "../services/consultationService"; // Adjust path as needed

export default function ConsultationList() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterName, setFilterName] = useState('');
  
  const navigate = useNavigate();

  // Fetch user's consultations
  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;
      if (filterName) params.name = filterName;
      
      const response = await getMyConsultations(params);
      setConsultations(response.data || response || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch consultations');
      console.error('Error fetching consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle consultation deletion
  const handleDelete = async (consultationId) => {
    if (!window.confirm('Are you sure you want to delete this consultation? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteConsultation(consultationId);
      
      // Remove from local state
      setConsultations(prev => prev.filter(c => c._id !== consultationId));
      setSuccess('Consultation deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete consultation');
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing consultation details
  const handleViewDetails = (consultation) => {
    navigate(`/consultations/${consultation._id}`);
  };

  // Handle editing consultation
  const handleEdit = (consultation) => {
    navigate(`/consultations/${consultation._id}/edit`);
  };

  // Handle PDF viewing
  const handleViewPDF = (consultationId) => {
    const pdfUrl = viewConsultationPDF(consultationId);
    window.open(pdfUrl, '_blank');
  };

  // Handle PDF download
  const handleDownloadPDF = async (consultationId, fileName = 'kundali.pdf') => {
    try {
      const blob = await downloadConsultationPDF(consultationId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Failed to download PDF');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterName('');
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Auto-search when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchConsultations();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterStatus, filterName]);

  // Initial fetch
  useEffect(() => {
    fetchConsultations();
  }, []);

  // Clear notifications after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Consultations</h1>
          <p className="text-gray-600">Manage your astrological consultations and client records</p>
        </div>

        {/* Statistics */}
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

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
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

            <button
              onClick={() => navigate('/consultations/create')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Consultations List */}
        {loading && consultations.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5V7a1 1 0 00-1-1H7a1 1 0 00-1 1v4.5a.5.5 0 01-.5.5h-.5a.5.5 0 01-.5-.5V5z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No consultations found</h3>
            <p className="text-gray-500 mb-4">Create your first consultation to get started</p>
            <button
              onClick={() => navigate('/consultations/create')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Create First Consultation
            </button>
          </div>
        ) : (
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
                    <th className="px-6 py-4 text-left font-semibold">Created</th>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          consultation.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {consultation.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(consultation.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(consultation)}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm font-medium"
                            title="View Details"
                          >
                            View
                          </button>
                          
                          <button
                            onClick={() => handleEdit(consultation)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                            title="Edit"
                          >
                            Edit
                          </button>
                          
                          {consultation.kundaliPdfName && (
                            <>
                              <button
                                onClick={() => handleViewPDF(consultation._id)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm font-medium"
                                title="View PDF"
                              >
                                PDF
                              </button>
                              
                              <button
                                onClick={() => handleDownloadPDF(consultation._id, consultation.kundaliPdfName)}
                                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors text-sm font-medium"
                                title="Download PDF"
                              >
                                Download
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(consultation._id)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            Delete
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
      </div>
    </div>
  );
}