import { useState, useEffect } from 'react';
import { useDataContext } from '../context/Data-context';

// Main Client Management Component
const ClientManagement = () => {
  const {
    categories,
    loading,
    setLoading,
    addClient,
    updateClient,
    deleteClient,
    getFilteredClients,
    getClientConsultations
  } = useDataContext();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientConsultations, setClientConsultations] = useState([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPhone, setFilterPhone] = useState('');

  // Get filtered clients
  const clients = getFilteredClients({
    searchTerm,
    filterCategory,
    filterPhone
  });

  // Show client profile with consultation history
  const showClientProfile = async (client) => {
    try {
      setLoading(true);
      
      const consultations = getClientConsultations(client._id);
      
      setSelectedClient(client);
      setClientConsultations(consultations);
      setShowProfileModal(true);
    } catch (err) {
      setError('Failed to fetch client details');
    } finally {
      setLoading(false);
    }
  };

  // Handle client update
  const handleClientUpdate = async (updatedClient) => {
    try {
      const result = await updateClient(selectedClient._id, updatedClient);
      setSelectedClient(result);
      setSuccess('Client updated successfully!');
    } catch (err) {
      setError('Failed to update client');
    }
  };

  // Handle client deletion
  const handleClientDelete = async (deletedId) => {
    try {
      await deleteClient(deletedId);
      setShowProfileModal(false);
      setSelectedClient(null);
      setSuccess('Client deleted successfully!');
    } catch (err) {
      setError('Failed to delete client');
    }
  };

  // Handle client creation
  const handleClientCreate = async (newClientData) => {
    try {
      await addClient(newClientData);
      setSuccess('Client created successfully!');
    } catch (err) {
      setError('Failed to create client');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterPhone('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <ClientHeader clientsCount={clients.length} />
        
        <ClientStatistics clients={clients} />
        
        <ClientSearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterPhone={filterPhone}
          setFilterPhone={setFilterPhone}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          categories={categories}
          clearFilters={clearFilters}
          onCreateClick={() => setShowCreateModal(true)}
        />

        <ClientsList
          clients={clients}
          loading={loading}
          onViewProfile={showClientProfile}
        />

        {/* Create Modal */}
        {showCreateModal && (
          <CreateClientModal
            categories={categories}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleClientCreate}
            setError={setError}
            setLoading={setLoading}
          />
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedClient && (
          <ClientProfileModal
            client={selectedClient}
            consultations={clientConsultations}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedClient(null);
              setClientConsultations([]);
            }}
            onEdit={() => {
              setShowProfileModal(false);
              setShowEditModal(true);
            }}
            onDelete={handleClientDelete}
            setError={setError}
            setLoading={setLoading}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedClient && (
          <EditClientModal
            client={selectedClient}
            categories={categories}
            onClose={() => {
              setShowEditModal(false);
              setShowProfileModal(true);
            }}
            onSuccess={handleClientUpdate}
            setError={setError}
            setLoading={setLoading}
          />
        )}

        {/* Toast Notifications */}
        <ToastNotification error={error} success={success} />
      </div>
    </div>
  );
};

// Client Header Component
const ClientHeader = ({ clientsCount }) => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold text-gray-800 mb-2">Client Management</h1>
    <p className="text-gray-600">Manage client profiles and consultation history</p>
  </div>
);

// Client Statistics Component
const ClientStatistics = ({ clients }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Clients</h3>
        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {clients.length}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Active This Month</h3>
        <div className="text-3xl font-bold text-green-600">
          {clients.filter(c => {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            return new Date(c.lastConsultation || c.createdAt) > lastMonth;
          }).length}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">New This Week</h3>
        <div className="text-3xl font-bold text-blue-600">
          {clients.filter(c => {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            return new Date(c.createdAt) > lastWeek;
          }).length}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Regular Clients</h3>
        <div className="text-3xl font-bold text-purple-600">
          {clients.filter(c => (c.consultationCount || 0) > 1).length}
        </div>
      </div>
    </div>
  </div>
);

// Client Search and Filters Component
const ClientSearchAndFilters = ({
  searchTerm, setSearchTerm, filterPhone, setFilterPhone,
  filterCategory, setFilterCategory, categories, clearFilters, onCreateClick
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name..."
        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
      />
      
      <input
        type="text"
        value={filterPhone}
        onChange={(e) => setFilterPhone(e.target.value)}
        placeholder="Search by phone..."
        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
      />
      
      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
      >
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
      
      <button
        onClick={clearFilters}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Clear Filters
      </button>
      
      <button
        onClick={onCreateClick}
        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 justify-center"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add New Client
      </button>
    </div>
  </div>
);

// Clients List Component - FIXED TABLE HEADERS
const ClientsList = ({ clients, loading, onViewProfile }) => {
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');

  if (loading && clients.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-lg">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No clients found</h3>
        <p className="text-gray-500">Add your first client to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Name</th>
              <th className="px-6 py-4 text-left font-semibold">Date of Birth</th>
              <th className="px-6 py-4 text-left font-semibold">Phone</th>
              <th className="px-6 py-4 text-left font-semibold">Place of Birth</th>
              <th className="px-6 py-4 text-left font-semibold">Consultations</th>
              <th className="px-6 py-4 text-left font-semibold">Last Consultation</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 capitalize">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {client.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {formatDate(client.dob || client.dateOfBirth)}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {client.phone}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {client.birthPlace || client.placeOfBirth}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {client.consultationCount || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {client.lastConsultation ? formatDate(client.lastConsultation) : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewProfile(client)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    View Profile
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

// Create Client Modal Component
const CreateClientModal = ({ categories, onClose, onSuccess, setError, setLoading }) => {
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
    categories: []
  });
  
  const [loading, setLocalLoading] = useState(false);

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

  const createClient = async () => {
    try {
      const requiredFields = ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'phone'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      setLocalLoading(true);
      setLoading(true);

      await onSuccess(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create client');
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
            <h3 className="text-2xl font-semibold text-gray-800">Add New Client</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <ClientForm
          formData={formData}
          categories={categories}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onSubmit={createClient}
          onCancel={onClose}
          loading={loading}
          submitLabel="Add Client"
        />
      </div>
    </div>
  );
};

// Edit Client Modal Component
const EditClientModal = ({ client, categories, onClose, onSuccess, setError, setLoading }) => {
  const [formData, setFormData] = useState({
    name: client.name || '',
    dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split('T')[0] : (client.dob ? client.dob.split('T')[0] : ''),
    timeOfBirth: client.timeOfBirth || client.birthTime || '',
    placeOfBirth: client.placeOfBirth || client.birthPlace || '',
    phone: client.phone || '',
    email: client.email || '',
    fatherName: client.fatherName || '',
    motherName: client.motherName || '',
    grandfatherName: client.grandfatherName || '',
    address: client.address || '',
    pincode: client.pincode || '',
    categories: client.categories?.map(cat => cat._id) || []
  });
  
  const [loading, setLocalLoading] = useState(false);

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

  const updateClient = async () => {
    try {
      const requiredFields = ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'phone'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      setLocalLoading(true);
      setLoading(true);

      await onSuccess(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update client');
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
            <h3 className="text-2xl font-semibold text-gray-800">Edit Client</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <ClientForm
          formData={formData}
          categories={categories}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onSubmit={updateClient}
          onCancel={onClose}
          loading={loading}
          submitLabel="Update Client"
        />
      </div>
    </div>
  );
};

// Reusable Client Form Component
const ClientForm = ({
  formData, categories, onInputChange, onCategoryChange,
  onSubmit, onCancel, loading, submitLabel
}) => (
  <div className="p-6 space-y-6">
    {/* Personal Details Section */}
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
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            required
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
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            required
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
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            required
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
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            required
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
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            required
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
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>

    {/* Family Details Section */}
    <div>
      <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Family Details (Optional)</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
          <input
            type="text"
            name="motherName"
            value={formData.motherName}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grandfather's Name</label>
          <input
            type="text"
            name="grandfatherName"
            value={formData.grandfatherName}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>

    {/* Address Details Section */}
    <div>
      <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Address Details (Optional)</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={onInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={onInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>

    {/* Categories Section */}
    <div>
      <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Categories</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map(category => (
          <label key={category._id} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.categories.includes(category._id)}
              onChange={() => onCategoryChange(category._id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{category.name}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="sticky bottom-0 bg-white border-t pt-6 flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={loading}
        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {submitLabel}
          </>
        )}
      </button>
    </div>
  </div>
);

// Client Profile Modal Component with Consultation History
const ClientProfileModal = ({ client, consultations, onClose, onEdit, onDelete, setError, setLoading }) => {
  const [loading, setLocalLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');
  const formatDateTime = (dateString) => new Date(dateString).toLocaleString('en-IN');

  const handleDelete = async () => {
    try {
      setLocalLoading(true);
      setLoading(true);
      
      await onDelete(client._id);
    } catch (err) {
      setError(err.message || 'Failed to delete client');
    } finally {
      setLocalLoading(false);
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 capitalize">{client.name}</h3>
                <p className="text-gray-600">Client Profile</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex border-b mt-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'consultations'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Consultation History ({consultations.length})
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-600 capitalize">{client.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date of Birth:</span>
                    <p className="text-gray-600">{formatDate(client.dob || client.dateOfBirth)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time of Birth:</span>
                    <p className="text-gray-600">{client.birthTime || client.timeOfBirth}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Place of Birth:</span>
                    <p className="text-gray-600">{client.birthPlace || client.placeOfBirth}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-600">{client.phone}</p>
                  </div>
                  {client.email && (
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-600">{client.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {(client.fatherName || client.motherName || client.grandfatherName) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Family Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {client.fatherName && (
                      <div>
                        <span className="font-medium text-gray-700">Father's Name:</span>
                        <p className="text-gray-600 capitalize">{client.fatherName}</p>
                      </div>
                    )}
                    {client.motherName && (
                      <div>
                        <span className="font-medium text-gray-700">Mother's Name:</span>
                        <p className="text-gray-600 capitalize">{client.motherName}</p>
                      </div>
                    )}
                    {client.grandfatherName && (
                      <div>
                        <span className="font-medium text-gray-700">Grandfather's Name:</span>
                        <p className="text-gray-600 capitalize">{client.grandfatherName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(client.address || client.pincode) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {client.address && (
                      <div>
                        <span className="font-medium text-gray-700">Address:</span>
                        <p className="text-gray-600">{client.address}</p>
                      </div>
                    )}
                    {client.pincode && (
                      <div>
                        <span className="font-medium text-gray-700">Pincode:</span>
                        <p className="text-gray-600">{client.pincode}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {client.categories && client.categories.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {client.categories.map(category => (
                      <span key={category._id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Client Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-700 mb-1">Total Consultations</h5>
                    <p className="text-2xl font-bold text-blue-600">{consultations.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-green-700 mb-1">Member Since</h5>
                    <p className="text-lg font-semibold text-green-600">
                      {formatDate(client.createdAt)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h5 className="font-medium text-purple-700 mb-1">Last Consultation</h5>
                    <p className="text-lg font-semibold text-purple-600">
                      {client.lastConsultation ? formatDate(client.lastConsultation) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Consultation History ({consultations.length})
              </h4>
              
              {consultations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h5 className="text-lg font-medium text-gray-600 mb-1">No Consultations Yet</h5>
                  <p className="text-gray-500">This client hasn't had any consultations yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((consultation, index) => (
                    <div key={consultation._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800">
                              Consultation #{consultation._id.slice(-8).toUpperCase()}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(consultation.consultationDate || consultation.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          consultation.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {consultation.status || 'pending'}
                        </span>
                      </div>
                      
                      {consultation.categories && consultation.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {consultation.categories.map(category => (
                            <span key={category._id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {category.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {consultation.prediction && (
                        <div className="mt-3">
                          <h6 className="font-medium text-gray-700 mb-1">Prediction:</h6>
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                            {consultation.prediction.slice(0, 200) + (consultation.prediction.length > 200 ? '...' : '')}
                          </div>
                        </div>
                      )}
                      
                      {consultation.suggestions && (
                        <div className="mt-2">
                          <h6 className="font-medium text-gray-700 mb-1">Suggestions:</h6>
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                            {consultation.suggestions.slice(0, 200) + (consultation.suggestions.length > 200 ? '...' : '')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
                  <h3 className="text-lg font-semibold text-gray-800">Delete Client</h3>
                  <p className="text-gray-600">Are you sure you want to delete this client?</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  This action cannot be undone. All data related to <strong>{client.name}</strong> and their consultation history will be permanently deleted.
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
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Toast Notification Component
const ToastNotification = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-6 py-4 rounded-lg shadow-lg text-white font-medium ${
        error ? 'bg-red-500' : 'bg-green-500'
      } animate-pulse`}>
        {error || success}
      </div>
    </div>
  );
};

export default ClientManagement;