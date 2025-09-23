// src/pages/ClientDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Env variable with fallback
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ClientDetails() {
  const { id } = useParams(); // clientId from URL
  const [client, setClient] = useState(null);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // optional auth

    // fetch client details
    axios.get(`${API_BASE}/clients/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setClient(res.data))
      .catch(err => console.error("Error fetching client:", err));

    // fetch consultations of this client
    axios.get(`${API_BASE}/consultations/client/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setConsultations(res.data))
      .catch(err => console.error("Error fetching consultations:", err));
  }, [id]);

  if (!client) return <p className="p-6">Loading client...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Client Info */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2">{client.name}</h2>
        <p><strong>DOB:</strong> {client.dob}</p>
        <p><strong>Time:</strong> {client.timeOfBirth}</p>
        <p><strong>Place:</strong> {client.placeOfBirth}</p>
      </div>

      {/* Consultation History */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Consultation History</h3>
        {consultations.length > 0 ? (
          <ul className="space-y-2">
            {consultations.map((c) => (
              <li key={c._id} className="border-b pb-2">
                <p><strong>Date:</strong> {new Date(c.date).toLocaleDateString()}</p>
                <p><strong>Prediction:</strong> {c.prediction}</p>
                <p><strong>Suggestion:</strong> {c.suggestion}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No consultations yet.</p>
        )}
      </div>

      {/* Button to create new consultation */}
      <div>
        <Link
          to={`/consultations/create/${id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          + Create Consultation
        </Link>
      </div>
    </div>
  );
}
