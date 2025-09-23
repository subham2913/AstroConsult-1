// src/pages/ConsultationHistoryPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { Editor } from "primereact/editor";

export default function ConsultationHistoryPage() {
  const { historyId } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/consultation-history/${historyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error("Failed to load consultation history");
        }
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [historyId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading consultation history...</p>
        </div>
      </div>
    );
  }

  if (error || !history) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading History</h3>
          <p className="text-red-600 mb-4">{error || "Consultation history not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-black-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back 
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Consultation History Details</h1>
              <p className="text-purple-100">Session conducted on {formatDate(history.consultationDate)}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gradient-to-br bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Session Info & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Session Info */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Session Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Consultation Date:</span>
                  <span className="text-gray-900">{formatDate(history.consultationDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      history.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : history.status === "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {history.status.charAt(0).toUpperCase() + history.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="text-gray-900">{formatDate(history.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Categories
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                {history.categories && history.categories.length > 0 ? (
                  <div className="space-y-2">
                    {history.categories.map((category, index) => (
                      <div
                        key={category._id || category || index}
                        className="flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {typeof category === 'object' ? category.name : category}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No categories assigned</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Planetary Positions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
                Planetary Positions
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(history.planetaryPositions) }}
                />
              </div>
            </div>

            {/* Prediction */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Prediction
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(history.prediction) }}
                />
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Suggestions
              </h2>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(history.suggestions) }}
                />
              </div>
            </div>

            {/* Session Notes */}
            {history.sessionNotes && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Session Notes
                </h2>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
                  <p className="whitespace-pre-line text-gray-700 leading-relaxed">{history.sessionNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
            <button
              onClick={() => navigate(`/consultation-history/${historyId}/edit`)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit History
            </button>
            
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center gap-2 justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}