import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/Data-context";
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
import CreateConsultationPage from './pages/CreateConsultationPage';

// New full page routes
import ConsultationDetailPage from "./pages/ConsultationDetailPage";
import EditConsultationPage from "./pages/EditConsultationPage";
import ConsultationHistoryPage from "./pages/ConsultationHistoryPage";
import EditConsultationHistoryPage from "./pages/EditConsultationHistoryPage";

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
        <Route
          path="/consultations/create"
          element={
            <PrivateRoute>
              <CreateConsultationPage />
            </PrivateRoute>
          }
        />

        {/* Full screen Consultation Detail & Edit pages */}
        <Route
          path="/consultations/:id"
          element={
            <PrivateRoute>
              <ConsultationDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/consultations/:id/edit"
          element={
            <PrivateRoute>
              <EditConsultationPage />
            </PrivateRoute>
          }
        />

       
        {/* Full screen Consultation History Detail & Edit pages */}
        <Route
          path="/consultation-history/:historyId"
          element={
            <PrivateRoute>
              <ConsultationHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/consultation-history/:historyId/edit"
          element={
            <PrivateRoute>
              <EditConsultationHistoryPage />
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
