// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import {DataProvider, useDataContext } from "./context/Data-context"; // Add this import
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminUsers from "./pages/AdminUsers";
import PrivateRoute from "./components/PrivateRoute";

// Existing pages
import Clients from "./pages/Clients";
import Categories from "./pages/Categories";
import SubCategories from "./pages/SubCategories";
import Consultations from "./pages/Consultations";


// Admin Route Component
function AdminRoute({ children }) {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <DataProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <PrivateRoute>
              <Clients />
            </PrivateRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />

        <Route
          path="/sub-categories"
          element={
            <PrivateRoute>
              <SubCategories />
            </PrivateRoute>
          }
        />

        <Route
          path="/consultations"
          element={
            <PrivateRoute>
              <Consultations />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            </PrivateRoute>
          }
        />

        {/* Default route: send to dashboard if logged in, else to login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DataProvider>
  );
}