import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { FaUsers, FaClock, FaCheck, FaTimes, FaTrash, FaChartBar } from "react-icons/fa";

export default function AdminUsers() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === 'pending') {
        const response = await api.get('/admin/users/pending');
        setUsers(response.data);
      } else if (activeTab === 'all') {
        const response = await api.get('/admin/users');
        setUsers(response.data.users || response.data);
      } else if (activeTab === 'stats') {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error?.response?.data?.msg || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/approve`);
      await loadData();
    } catch (error) {
      setError(error?.response?.data?.msg || 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Reason for rejection (optional):') || 'No reason provided';
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/reject`, { reason });
      await loadData();
    } catch (error) {
      setError(error?.response?.data?.msg || 'Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setActionLoading(userId);
      try {
        await api.delete(`/admin/users/${userId}`);
        await loadData();
      } catch (error) {
        setError(error?.response?.data?.msg || 'Failed to delete user');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'pending', label: 'Pending Approval', icon: FaClock, color: 'text-yellow-600' },
    { id: 'all', label: 'All Users', icon: FaUsers, color: 'text-blue-600' },
    { id: 'stats', label: 'Statistics', icon: FaChartBar, color: 'text-green-600' },
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-25 to-yellow-25">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-25 to-yellow-25 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            User Management
          </h1>
          <p className="text-gray-600">Manage user registrations and approvals</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-orange-50'
                  }`}
                >
                  <Icon className={activeTab === tab.id ? 'text-white' : tab.color} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-orange-600">{stats.total}</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">By Status</h3>
                  <div className="space-y-2">
                    {stats.byStatus.map((item) => (
                      <div key={item._id} className="flex justify-between items-center">
                        <span className="capitalize text-gray-600 font-medium">{item._id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item._id === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : item._id === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">By Role</h3>
                  <div className="space-y-2">
                    {stats.byRole.map((item) => (
                      <div key={item._id} className="flex justify-between items-center">
                        <span className="capitalize text-gray-600 font-medium">{item._id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item._id === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Table */}
            {(activeTab === 'pending' || activeTab === 'all') && (
              <div className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeTab === 'pending' ? 'Users Pending Approval' : 'All Users'}
                  </h3>
                </div>
                
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">
                      {activeTab === 'pending' 
                        ? 'No users are waiting for approval.' 
                        : 'No users in the system yet.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registered
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'approved' 
                                  ? 'bg-green-100 text-green-800'
                                  : user.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {user.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(user._id)}
                                      disabled={actionLoading === user._id}
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <FaCheck className="h-3 w-3 mr-1" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleReject(user._id)}
                                      disabled={actionLoading === user._id}
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <FaTimes className="h-3 w-3 mr-1" />
                                      Reject
                                    </button>
                                  </>
                                )}
                                
                                {user.role !== 'admin' && (
                                  <button
                                    onClick={() => handleDelete(user._id)}
                                    disabled={actionLoading === user._id}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <FaTrash className="h-3 w-3 mr-1" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}