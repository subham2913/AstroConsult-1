// src/pages/AddClient.jsx
import { useState } from "react";
import axios from "axios";

// Use env variable for API base, fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AddClient({ onClientAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    birthTime: "",
    birthPlace: "",
    phone: "",
    email: "",
    fatherName: "",
    motherName: "",
    grandfatherName: "",
    address: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // auth token
      const res = await axios.post(
        `${API_BASE}/clients`, // updated URL
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Client added:", res.data);
      if (onClientAdded) onClientAdded();
      // Optional: reset form
      setFormData({
        name: "",
        dob: "",
        birthTime: "",
        birthPlace: "",
        phone: "",
        email: "",
        fatherName: "",
        motherName: "",
        grandfatherName: "",
        address: "",
        pincode: "",
      });
    } catch (error) {
      console.error("Error adding client:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to add client");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border p-4 rounded-lg bg-white shadow"
    >
      <h3 className="text-lg font-semibold">Add New Client</h3>

      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="border p-2 w-full" required />
      <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="border p-2 w-full" required />
      <input type="time" name="birthTime" value={formData.birthTime} onChange={handleChange} className="border p-2 w-full" required />
      <input name="birthPlace" placeholder="Birth Place" value={formData.birthPlace} onChange={handleChange} className="border p-2 w-full" required />
      <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="border p-2 w-full" required />
      <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="border p-2 w-full" />

      <input name="fatherName" placeholder="Father Name" value={formData.fatherName} onChange={handleChange} className="border p-2 w-full" />
      <input name="motherName" placeholder="Mother Name" value={formData.motherName} onChange={handleChange} className="border p-2 w-full" />
      <input name="grandfatherName" placeholder="Grandfather Name" value={formData.grandfatherName} onChange={handleChange} className="border p-2 w-full" />
      <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="border p-2 w-full" />
      <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} className="border p-2 w-full" />

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save Client
      </button>
    </form>
  );
}
