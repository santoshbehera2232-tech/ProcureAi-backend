import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';

// Pages
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { PurchaseRequirements } from './pages/PurchaseRequirements.jsx';
import { RFQs } from './pages/RFQs.jsx';
import { QuotationsCompare } from './pages/QuotationsCompare.jsx';
import { PurchaseOrders } from './pages/PurchaseOrders.jsx';
import { Shipments } from './pages/Shipments.jsx';
import { Deliveries } from './pages/Deliveries.jsx';
import { Invoices } from './pages/Invoices.jsx';
import { Suppliers } from './pages/Suppliers.jsx';
import { Analytics } from './pages/Analytics.jsx';
import { Anomalies } from './pages/Anomalies.jsx';
import { Documents } from './pages/Documents.jsx';
import { AuditLogs } from './pages/AuditLogs.jsx';
import { Settings } from './pages/Settings.jsx';
import { SupplierPortal } from './pages/SupplierPortal.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes wrapped in AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/purchase-requirements" element={<PurchaseRequirements />} />
            <Route path="/rfqs" element={<RFQs />} />
            <Route path="/quotations/compare" element={<QuotationsCompare />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrders />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />

            {/* Supplier Portal Routes */}
            <Route path="/supplier-portal" element={<SupplierPortal />} />
            <Route path="/supplier-portal/rfqs" element={<SupplierPortal />} />
            <Route path="/supplier-portal/quote" element={<SupplierPortal />} />
            <Route path="/supplier-portal/orders" element={<SupplierPortal />} />
            <Route path="/supplier-portal/shipments" element={<SupplierPortal />} />
            <Route path="/supplier-portal/invoices" element={<SupplierPortal />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
