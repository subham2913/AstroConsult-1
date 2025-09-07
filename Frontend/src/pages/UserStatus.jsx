import { useAuth } from "../context/AuthContext";
import { FaCheckCircle, FaClock, FaTimesCircle, FaUser, FaEnvelope, FaIdCard } from "react-icons/fa";

export default function UserStatus() {
  const { user } = useAuth();

  const getStatusIcon = () => {
    switch (user?.status) {
      case 'approved':
        return <FaCheckCircle className="h-16 w-16 text-green-500" />;
      case 'rejected':
        return <FaTimesCircle className="h-16 w-16 text-red-500" />;
      default:
        return <FaClock className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (user?.status) {
      case 'approved':
        return 'from-green-50 to-green-100 border-green-200';
      case 'rejected':
        return 'from-red-50 to-red-100 border-red-200';
      default:
        return 'from-yellow-50 to-yellow-100 border-yellow-200';
    }
  };

  const getStatusMessage = () => {
    switch (user?.status) {
      case 'approved':
        return {
          title: 'Account Approved',
          message: 'Your account has been approved! You now have full access to all features.'
        };
      case 'rejected':
        return {
          title: 'Account Rejected',
          message: user?.rejectionReason || 'Your account has been rejected. Please contact support for assistance.'
        };
      default:
        return {
          title: 'Pending Approval',
          message: 'Your account is currently pending admin approval. You\'ll receive full access once approved.'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-25 to-yellow-25 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
            <h1 className="text-2xl font-bold">Account Status</h1>
            <p className="text-orange-100 mt-2">View your current account information and status</p>
          </div>

          <div className="p-6">
            {/* Status Card */}
            <div className={`bg-gradient-to-r ${getStatusColor()} rounded-xl p-6 mb-6 border-2`}>
              <div className="flex items-center justify-center mb-4">
                {getStatusIcon()}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{statusInfo.title}</h2>
                <p className="text-gray-700">{statusInfo.message}</p>
              </div>
            </div>

            {/* User Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaUser className="h-5 w-5 text-orange-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Full Name</span>
                    <span className="font-medium text-gray-800">{user?.name}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaEnvelope className="h-5 w-5 text-orange-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Email Address</span>
                    <span className="font-medium text-gray-800">{user?.email}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaIdCard className="h-5 w-5 text-orange-600" />
                  <div>
                    <span className="text-sm text-gray-500 block">Account Role</span>
                    <span className="font-medium text-gray-800 capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            {user?.status !== 'approved' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
                <p className="text-blue-700 text-sm">
                  If you have questions about your account status, please contact our support team for assistance.
                </p>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Contact Support
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}