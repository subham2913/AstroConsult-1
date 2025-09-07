import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      // Backend response should be: { token, user: { id, name, email, role, isApproved, status } }
      login({ token: res.data.token, user: res.data.user });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const errorMsg = error?.response?.data?.msg || "Login failed";
      const status = error?.response?.data?.status;
      
      // Handle specific approval status messages
      if (status === 'pending') {
        setErr("Your account is pending admin approval. Please wait for approval before logging in.");
      } else if (status === 'rejected') {
        setErr("Your account has been rejected. Please contact support for assistance.");
      } else {
        setErr(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-orange-25 to-yellow-25">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 border border-orange-200">
        <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
          AstroConsult - Login
        </h1>
        
        {err && (
          <div className={`mb-4 p-3 text-sm rounded-lg border ${
            err.includes('pending') 
              ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
              : err.includes('rejected')
              ? 'text-red-600 bg-red-50 border-red-200'
              : 'text-red-600 bg-red-50 border-red-200'
          }`}>
            {err}
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-60 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}