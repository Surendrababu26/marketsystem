import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import CreateRFQ from './pages/buyer/CreateRFQ';
import MyRFQs from './pages/buyer/MyRFQs';
import RFQQuotations from './pages/buyer/RFQQuotations';

// Supplier Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import RFQList from './pages/supplier/RFQList';
import RFQDetails from './pages/supplier/RFQDetails';
import MyQuotations from './pages/supplier/MyQuotations';

// Root Redirect component based on auth status and role
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = (role || '').toLowerCase();
  if (currentRole === 'buyer') {
    return <Navigate to="/buyer/dashboard" replace />;
  } else if (currentRole === 'supplier') {
    return <Navigate to="/supplier/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Root Route */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Buyer Routes (Protected) */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/create-rfq"
            element={
              <ProtectedRoute allowedRole="buyer">
                <CreateRFQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/rfqs"
            element={
              <ProtectedRoute allowedRole="buyer">
                <MyRFQs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/rfqs/:id/quotations"
            element={
              <ProtectedRoute allowedRole="buyer">
                <RFQQuotations />
              </ProtectedRoute>
            }
          />

          {/* Supplier Routes (Protected) */}
          <Route
            path="/supplier/dashboard"
            element={
              <ProtectedRoute allowedRole="supplier">
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/rfqs"
            element={
              <ProtectedRoute allowedRole="supplier">
                <RFQList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/rfqs/:id"
            element={
              <ProtectedRoute allowedRole="supplier">
                <RFQDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/quotations"
            element={
              <ProtectedRoute allowedRole="supplier">
                <MyQuotations />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Wildcard Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
