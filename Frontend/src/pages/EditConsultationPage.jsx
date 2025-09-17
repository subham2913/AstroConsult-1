import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ConsultationForm from './Consultations';


const API_BASE = 'http://localhost:5000/api';

const EditConsultationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        setLoading(true);
        const [res1, res2] = await Promise.all([
          fetch(`${API_BASE}/consultations/details/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/categories`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (!res1.ok || !res2.ok) throw new Error('Failed to load data');
        const [cons, cats] = await Promise.all([res1.json(), res2.json()]);
        setConsultation(cons);
        setCategories(cats.data || cats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEditSuccess = () => {
    navigate(`/consultations/${id}`);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen">{error}</div>;
  if (!consultation) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-4">Edit Consultation</h2>
        <ConsultationForm
          formDataInit={consultation}
          categories={categories}
          onSuccess={handleEditSuccess}
          setError={setError}
          setLoading={setLoading}
          submitLabel="Update Consultation"
        />
      </div>
    </div>
  );
};

export default EditConsultationPage;
