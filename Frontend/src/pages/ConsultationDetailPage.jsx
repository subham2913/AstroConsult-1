import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PDFViewer from '../components/PDFViewer';

const API_BASE = 'http://localhost:5000/api';

const ConsultationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConsultation = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE}/consultations/details/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Consultation not found');
        const data = await res.json();
        setConsultation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultation();
  }, [id]);

  if (loading) return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="w-full h-screen flex items-center justify-center text-red-600">{error}</div>;

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-12">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">{consultation.name}</h1>
        <p className="text-gray-700 mb-4">Status: <span className="font-semibold capitalize">{consultation.status}</span></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Date of Birth:</strong> {formatDate(consultation.dateOfBirth)}</p>
            <p><strong>Time of Birth:</strong> {consultation.timeOfBirth}</p>
            <p><strong>Place of Birth:</strong> {consultation.placeOfBirth}</p>
            <p><strong>Phone:</strong> {consultation.phone}</p>
            {consultation.email && <p><strong>Email:</strong> {consultation.email}</p>}
          </div>
          <div>
            {consultation.address && <p><strong>Address:</strong> {consultation.address}</p>}
            {consultation.pincode && <p><strong>Pincode:</strong> {consultation.pincode}</p>}
            {consultation.fatherName && <p><strong>Father's Name:</strong> {consultation.fatherName}</p>}
            {consultation.motherName && <p><strong>Mother's Name:</strong> {consultation.motherName}</p>}
            {consultation.grandfatherName && <p><strong>Grandfather's Name:</strong> {consultation.grandfatherName}</p>}
          </div>
        </div>

        {consultation.kundaliPdfName && (
          <div className="my-4">
            <h4 className="font-bold mb-2">Kundali PDF:</h4>
            <PDFViewer consultation={consultation} />
          </div>
        )}

        {consultation.planetaryPositions && (
          <div className="mb-4">
            <h4 className="font-bold">Planetary Positions</h4>
            <div className="prose" dangerouslySetInnerHTML={{ __html: consultation.planetaryPositions }} />
          </div>
        )}

        {consultation.prediction && (
          <div className="mb-4">
            <h4 className="font-bold">Prediction</h4>
            <div className="prose" dangerouslySetInnerHTML={{ __html: consultation.prediction }} />
          </div>
        )}

        {consultation.suggestions && (
          <div className="mb-4">
            <h4 className="font-bold">Suggestions</h4>
            <div className="prose" dangerouslySetInnerHTML={{ __html: consultation.suggestions }} />
          </div>
        )}

        {consultation.categories && consultation.categories.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {consultation.categories.map((c) =>
                <span key={c._id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg">{c.name}</span>)}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <Link
            to={`/consultations/${consultation._id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </Link>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400">Back</button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetailPage;
