import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for shared data
const DataContext = createContext();

// Custom hook to use the data context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

// Data Provider component
export const DataProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE =   import.meta.env.VITE_API_URL ||'http://localhost:5000/api';
  const getAuthToken = () => localStorage.getItem('token') || 'demo-token';

  // API helper function
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initialize data from MongoDB
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Try to load data from API first
        console.log('Loading data from API...');
        
        const [categoriesData, clientsData, consultationsData] = await Promise.all([
          apiCall('/categories').catch(err => {
            console.warn('Categories API failed:', err);
            return { data: getDemoCategories() };
          }),
          apiCall('/clients').catch(err => {
            console.warn('Clients API failed:', err);
            return { data: getDemoClients() };
          }),
          apiCall('/consultations').catch(err => {
            console.warn('Consultations API failed:', err);
            return { data: getDemoConsultations() };
          })
        ]);

        // Handle different response formats and ensure arrays
        const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : 
                          Array.isArray(categoriesData) ? categoriesData : 
                          getDemoCategories();

        const clients = Array.isArray(clientsData?.data) ? clientsData.data : 
                       Array.isArray(clientsData) ? clientsData : 
                       getDemoClients();

        const consultations = Array.isArray(consultationsData?.data) ? consultationsData.data : 
                             Array.isArray(consultationsData) ? consultationsData : 
                             getDemoConsultations();

        console.log('Data loaded successfully:', {
          categories: categories.length,
          clients: clients.length, 
          consultations: consultations.length
        });

        console.log('Sample consultation data:', consultations[0]);

        setCategories(categories);
        setClients(clients);
        setConsultations(consultations);

      } catch (error) {
        console.error('Complete initialization failed:', error);
        // Always provide fallback data
        const demoCategories = getDemoCategories();
        const demoClients = getDemoClients();
        const demoConsultations = getDemoConsultations();
        
        console.log('Using demo data as fallback:', {
          categories: demoCategories.length,
          clients: demoClients.length,
          consultations: demoConsultations.length
        });
        
        setCategories(demoCategories);
        setClients(demoClients);
        setConsultations(demoConsultations);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Demo data functions (fallback)
  const getDemoCategories = () => [
    { _id: 'cat1', name: 'Career Guidance' },
    { _id: 'cat2', name: 'Marriage Compatibility' },
    { _id: 'cat3', name: 'Health & Wellness' },
    { _id: 'cat4', name: 'Financial Planning' },
    { _id: 'cat5', name: 'Education' }
  ];

  const getDemoClients = () => [
    {
      _id: '1',
      name: 'rajesh kumar',
      dateOfBirth: '1990-05-15',
      timeOfBirth: '10:30',
      placeOfBirth: 'Mumbai',
      phone: '+91-9876543210',
      email: 'rajesh@example.com',
      fatherName: 'suresh kumar',
      motherName: 'sunita devi',
      consultationCount: 2,
      lastConsultation: '2024-01-20',
      createdAt: '2023-12-01'
    }
  ];

  const getDemoConsultations = () => [
    {
      _id: 'cons1',
      clientId: '1',
      name: 'rajesh kumar',
      dateOfBirth: '1990-05-15',
      consultationDate: '2024-01-20',
      status: 'completed',
      categories: [{ _id: 'cat1', name: 'Career Guidance' }],
      prediction: 'Career growth predicted.',
      suggestions: 'Focus on skill development.',
      createdAt: '2024-01-20'
    }
  ];

  // Client operations
  const addClient = async (clientData) => {
    try {
      // Map frontend field names to backend field names
      const mappedClientData = {
        name: clientData.name,
        dob: clientData.dateOfBirth || clientData.dob, // Frontend sends "dateOfBirth", backend expects "dob"
        birthTime: clientData.timeOfBirth || clientData.birthTime, // Frontend sends "timeOfBirth", backend expects "birthTime"
        birthPlace: clientData.placeOfBirth || clientData.birthPlace, // Frontend sends "placeOfBirth", backend expects "birthPlace"
        phone: clientData.phone,
        email: clientData.email,
        fatherName: clientData.fatherName,
        motherName: clientData.motherName,
        grandfatherName: clientData.grandfatherName,
        address: clientData.address,
        pincode: clientData.pincode,
        consultationCount: 0,
        lastConsultation: null,
        createdAt: new Date().toISOString()
      };

      console.log('Sending client data to backend:', mappedClientData);

      const response = await apiCall('/clients', 'POST', mappedClientData);
      const savedClient = response.data || response;

      // Update local state with the saved client (mapping back to frontend format)
      const frontendClient = {
        ...savedClient,
        dateOfBirth: savedClient.dob,
        timeOfBirth: savedClient.birthTime,
        placeOfBirth: savedClient.birthPlace
      };

      setClients(prev => [frontendClient, ...prev]);
      return frontendClient;

    } catch (error) {
      console.error('Failed to add client:', error);
      throw error;
    }
  };

  const updateClient = async (clientId, clientData) => {
    try {
      const response = await apiCall(`/clients/${clientId}`, 'PUT', clientData);
      const updatedClient = response.data || response;
      
      // Update local state
      setClients(prev => prev.map(client => 
        client._id === clientId ? updatedClient : client
      ));

      // Update related consultations
      setConsultations(prev => prev.map(consultation => 
        consultation.clientId === clientId ? {
          ...consultation,
          name: updatedClient.name,
          dateOfBirth: updatedClient.dateOfBirth,
          phone: updatedClient.phone,
          email: updatedClient.email
        } : consultation
      ));

      return updatedClient;

    } catch (error) {
      console.error('Failed to update client:', error);
      throw error;
    }
  };

  const deleteClient = async (clientId) => {
    try {
      await apiCall(`/clients/${clientId}`, 'DELETE');
      
      // Update local state
      setClients(prev => prev.filter(client => client._id !== clientId));
      setConsultations(prev => prev.filter(consultation => consultation.clientId !== clientId));

    } catch (error) {
      console.error('Failed to delete client:', error);
      throw error;
    }
  };

  // Enhanced API helper function for file uploads
  const apiCallWithFile = async (endpoint, method = 'GET', data = null, file = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      };

      // Handle file uploads with FormData
      if (file || (data && method !== 'GET')) {
        if (file) {
          const formData = new FormData();
          if (data) {
            formData.append('consultationData', JSON.stringify(data));
          }
          formData.append('kundaliPdf', file);
          config.body = formData;
        } else {
          // Regular JSON data
          config.headers['Content-Type'] = 'application/json';
          config.body = JSON.stringify(data);
        }
      }

      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Consultation operations - Updated for file handling
  const addConsultation = async (consultationData, kundaliFile = null) => {
    try {
      console.log('Creating consultation with data:', consultationData);
      console.log('PDF file:', kundaliFile?.name);

      const newConsultation = {
        ...consultationData,
        createdAt: new Date().toISOString()
      };

      // First, check if client exists or create new one
      let clientId = null;
      const existingClient = clients.find(client => 
        client.phone === consultationData.phone || 
        (client.name.toLowerCase() === consultationData.name.toLowerCase() && 
         client.dateOfBirth === consultationData.dateOfBirth)
      );

      if (existingClient) {
        clientId = existingClient._id;
        // Update client's consultation count
        await updateClientConsultationCount(clientId, 'increment');
      } else {
        // Create new client
        const newClientData = {
          name: consultationData.name,
          dateOfBirth: consultationData.dateOfBirth,
          timeOfBirth: consultationData.timeOfBirth,
          placeOfBirth: consultationData.placeOfBirth,
          phone: consultationData.phone,
          email: consultationData.email,
          fatherName: consultationData.fatherName,
          motherName: consultationData.motherName,
          grandfatherName: consultationData.grandfatherName,
          address: consultationData.address,
          pincode: consultationData.pincode,
          consultationCount: 1,
          lastConsultation: consultationData.consultationDate || new Date().toISOString()
        };

        const newClient = await addClient(newClientData);
        clientId = newClient._id;
      }

      // Add consultation with clientId
      newConsultation.clientId = clientId;

      // Use the enhanced API call with file support
      const response = await apiCallWithFile('/consultations', 'POST', newConsultation, kundaliFile);
      const savedConsultation = response.data || response;

      console.log('Consultation created successfully:', savedConsultation);

      // Update local state
      setConsultations(prev => [savedConsultation, ...prev]);
      return savedConsultation;

    } catch (error) {
      console.error('Failed to add consultation:', error);
      throw error;
    }
  };

  const updateConsultation = async (consultationId, consultationData, kundaliFile = null) => {
    try {
      console.log('Updating consultation:', consultationId, consultationData);
      console.log('New PDF file:', kundaliFile?.name);

      // Use the enhanced API call with file support
      const response = await apiCallWithFile(`/consultations/${consultationId}`, 'PUT', consultationData, kundaliFile);
      const updatedConsultation = response.data || response;
      
      console.log('Consultation updated successfully:', updatedConsultation);

      // Update local state
      setConsultations(prev => prev.map(consultation => 
        consultation._id === consultationId ? updatedConsultation : consultation
      ));

      // Update corresponding client data if needed
      if (updatedConsultation.clientId) {
        const clientUpdateData = {
          name: updatedConsultation.name,
          dateOfBirth: updatedConsultation.dateOfBirth,
          phone: updatedConsultation.phone,
          email: updatedConsultation.email,
          lastConsultation: updatedConsultation.consultationDate
        };
        await updateClient(updatedConsultation.clientId, clientUpdateData);
      }

      return updatedConsultation;

    } catch (error) {
      console.error('Failed to update consultation:', error);
      throw error;
    }
  };

  const deleteConsultation = async (consultationId) => {
    try {
      const consultation = consultations.find(c => c._id === consultationId);
      
      await apiCall(`/consultations/${consultationId}`, 'DELETE');
      
      // Update local state
      setConsultations(prev => prev.filter(c => c._id !== consultationId));

      // Update client consultation count
      if (consultation?.clientId) {
        await updateClientConsultationCount(consultation.clientId, 'decrement');
      }

    } catch (error) {
      console.error('Failed to delete consultation:', error);
      throw error;
    }
  };

  // Helper function to update client consultation count
  const updateClientConsultationCount = async (clientId, action) => {
    try {
      const endpoint = `/clients/${clientId}/${action === 'increment' ? 'increment' : 'decrement'}-consultation`;
      await apiCall(endpoint, 'PATCH');
      
      // Update local state
      setClients(prev => prev.map(client => 
        client._id === clientId ? {
          ...client,
          consultationCount: action === 'increment' 
            ? (client.consultationCount || 0) + 1 
            : Math.max((client.consultationCount || 1) - 1, 0)
        } : client
      ));
    } catch (error) {
      console.error('Failed to update consultation count:', error);
    }
  };

  // Get consultations for a specific client
  const getClientConsultations = (clientId) => {
    return consultations.filter(consultation => consultation.clientId === clientId);
  };

  // Refresh data from server
  const refreshData = async () => {
    try {
      const [clientsData, consultationsData] = await Promise.all([
        apiCall('/clients'),
        apiCall('/consultations')
      ]);

      setClients(clientsData.data || clientsData);
      setConsultations(consultationsData.data || consultationsData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // Filter functions with null checks
  const getFilteredClients = (filters) => {
    // Return empty array if clients is not loaded yet
    if (!Array.isArray(clients)) {
      return [];
    }
    
    let filteredClients = [...clients];

    if (filters.searchTerm) {
      filteredClients = filteredClients.filter(client =>
        client.name?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.filterPhone) {
      filteredClients = filteredClients.filter(client =>
        client.phone?.includes(filters.filterPhone)
      );
    }

    if (filters.filterCategory) {
      filteredClients = filteredClients.filter(client =>
        client.categories?.some(cat => cat._id === filters.filterCategory)
      );
    }

    return filteredClients;
  };

  const getFilteredConsultations = (filters) => {
    // Return empty array if consultations is not loaded yet
    if (!Array.isArray(consultations)) {
      return [];
    }
    
    let filteredConsultations = [...consultations];

    if (filters.searchTerm) {
      filteredConsultations = filteredConsultations.filter(consultation =>
        consultation.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        consultation.phone?.includes(filters.searchTerm) ||
        consultation.placeOfBirth?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.filterName) {
      filteredConsultations = filteredConsultations.filter(consultation =>
        consultation.name?.toLowerCase().includes(filters.filterName.toLowerCase())
      );
    }

    if (filters.filterDOB) {
      filteredConsultations = filteredConsultations.filter(consultation =>
        consultation.dateOfBirth === filters.filterDOB
      );
    }

    if (filters.filterCategory) {
      filteredConsultations = filteredConsultations.filter(consultation =>
        consultation.categories?.some(cat => cat._id === filters.filterCategory)
      );
    }

    if (filters.filterStatus) {
      filteredConsultations = filteredConsultations.filter(consultation =>
        consultation.status === filters.filterStatus
      );
    }

    return filteredConsultations;
  };

  const contextValue = {
    // Data
    clients,
    consultations,
    categories,
    loading,
    error,
    setLoading,

    // Client operations
    addClient,
    updateClient,
    deleteClient,

    // Consultation operations
    addConsultation,
    updateConsultation,
    deleteConsultation,
    getClientConsultations,

    // Filter functions
    getFilteredClients,
    getFilteredConsultations,

    // Utility functions
    refreshData
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};