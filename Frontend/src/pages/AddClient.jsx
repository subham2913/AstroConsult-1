// src/pages/AddClient.jsx
import { useState } from "react";
import axios from "axios";

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
      const token = localStorage.getItem("token"); // 👈 authMiddleware requires token
      const res = await axios.post(
        "http://localhost:5000/api/clients",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Client added:", res.data);
      if (onClientAdded) onClientAdded();
    } catch (error) {
      console.error("Error adding client:", error.response?.data || error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border p-4 rounded-lg bg-white shadow"
    >
      <h3 className="text-lg font-semibold">Add New Client</h3>

      <input name="name" placeholder="Name" onChange={handleChange} className="border p-2 w-full" required />
      <input type="date" name="dob" onChange={handleChange} className="border p-2 w-full" required />
      <input type="time" name="birthTime" onChange={handleChange} className="border p-2 w-full" required />
      <input name="birthPlace" placeholder="Birth Place" onChange={handleChange} className="border p-2 w-full" required />
      <input name="phone" placeholder="Phone" onChange={handleChange} className="border p-2 w-full" required />
      <input name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full" />

      <input name="fatherName" placeholder="Father Name" onChange={handleChange} className="border p-2 w-full" />
      <input name="motherName" placeholder="Mother Name" onChange={handleChange} className="border p-2 w-full" />
      <input name="grandfatherName" placeholder="Grandfather Name" onChange={handleChange} className="border p-2 w-full" />
      <input name="address" placeholder="Address" onChange={handleChange} className="border p-2 w-full" />
      <input name="pincode" placeholder="Pincode" onChange={handleChange} className="border p-2 w-full" />

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save Client
      </button>
    </form>
  );
}
