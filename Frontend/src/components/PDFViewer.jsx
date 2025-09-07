import React, { useState } from 'react';

const PDFViewer = ({ consultation }) => {
  const [loading, setLoading] = useState(false);
  
  const getAuthToken = () => localStorage.getItem('token');

  // Function to view PDF in new tab using fetch (matching your existing patterns)
  const viewPDF = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(
        `http://localhost:5000/api/consultations/${consultation._id}/pdf/view`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load PDF');
      }

      // Create blob URL and open in new tab
      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Error opening PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to download PDF
  const downloadPDF = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(
        `http://localhost:5000/api/consultations/${consultation._id}/pdf`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      // Create download link
      const pdfBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = consultation.kundaliPdfName || 'kundali.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if PDF exists (using your existing hasPDF virtual or kundaliFileId)
  const hasPDF = consultation.hasPDF || consultation.kundaliFileId || consultation.kundaliPdfName;

  if (!hasPDF) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No PDF available for this consultation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-100">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{consultation.kundaliPdfName || 'Kundali PDF'}</p>
          <p className="text-sm text-gray-600">PDF Document</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={viewPDF}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
          View PDF
        </button>
        
        <button 
          onClick={downloadPDF}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          Download
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;