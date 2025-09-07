import { useEffect, useState } from "react";
import api from "../api";

export default function ConsultationList() {
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/consultations");
        setConsultations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Consultations</h2>
      <ul className="space-y-2">
        {consultations.map((c) => (
          <li key={c._id} className="p-3 bg-gray-100 rounded shadow">
            <p><strong>Client:</strong> {c.clientId?.name}</p>
            <p><strong>Doctor:</strong> {c.doctorId?.name}</p>
            <p><strong>Date:</strong> {new Date(c.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
