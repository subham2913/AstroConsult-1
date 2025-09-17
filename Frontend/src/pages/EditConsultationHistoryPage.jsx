import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "primereact/editor";
import DOMPurify from "dompurify";

export default function EditConsultationHistoryPage() {
  const { historyId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    planetaryPositions: "",
    prediction: "",
    suggestions: "",
    sessionNotes: "",
    consultationDate: "",
    status: "completed",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";
  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/consultation-history/${historyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch consultation history");

        const data = await response.json();

        setFormData({
          planetaryPositions: data.planetaryPositions || "",
          prediction: data.prediction || "",
          suggestions: data.suggestions || "",
          sessionNotes: data.sessionNotes || "",
          consultationDate: data.consultationDate ? data.consultationDate.slice(0, 10) : "",
          status: data.status || "completed",
        });
      } catch (err) {
        setError(err.message || "Error loading data");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [historyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((fd) => ({ ...fd, [name]: value }));
  };

  const handleEditorChange = (field) => (e) => {
    setFormData((fd) => ({ ...fd, [field]: e.htmlValue }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Basic validation
  if (!formData.consultationDate) {
    setError("Consultation date is required");
    return;
  }

  setSaving(true);
  setError("");
  const token = getAuthToken();
  if (!token) {
    setError("Authentication required");
    setSaving(false);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/consultation-history/${historyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",   // ✅ add this
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData), // ✅ now it will be parsed correctly
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Failed to update consultation history");
    }

    alert("Consultation history updated successfully");
    navigate(-1); // Go back to previous page
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Edit Consultation History</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back
          </button>
        </div>

        {error && (
          <p className="mb-4 text-red-600 font-semibold">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-semibold">Consultation Date</label>
            <input
              type="date"
              name="consultationDate"
              value={formData.consultationDate}
              onChange={handleInputChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Planetary Positions</label>
            <Editor
              value={formData.planetaryPositions}
              onTextChange={handleEditorChange("planetaryPositions")}
              style={{ height: "150px" }}
            />
            <div className="prose mt-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.planetaryPositions) }} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Prediction</label>
            <Editor
              value={formData.prediction}
              onTextChange={handleEditorChange("prediction")}
              style={{ height: "150px" }}
            />
            <div className="prose mt-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.prediction) }} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Suggestions</label>
            <Editor
              value={formData.suggestions}
              onTextChange={handleEditorChange("suggestions")}
              style={{ height: "150px" }}
            />
            <div className="prose mt-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.suggestions) }} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Session Notes</label>
            <textarea
              name="sessionNotes"
              value={formData.sessionNotes}
              onChange={handleInputChange}
              rows={4}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
