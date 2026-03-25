/**
 * Main App Component
 * Routing and global providers
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ScoresPage from './pages/ScoresPage';
import DrawsPage from './pages/DrawsPage';
import CharitiesPage from './pages/CharitiesPage';
import CharityDetailPage from './pages/CharityDetailPage';
import WinningsPage from './pages/WinningsPage';
import PricingPage from './pages/PricingPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDraws from './pages/admin/AdminDraws';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners from './pages/admin/AdminWinners';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/charities" element={<CharitiesPage />} />
      <Route path="/charities/:charityId" element={<CharityDetailPage />} />
      <Route path="/draws" element={<DrawsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      
      {/* Subscription Success (after Stripe payment) */}
      <Route
        path="/subscription-success"
        element={
          <ProtectedRoute>
            <SubscriptionSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
      
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scores"
        element={
          <ProtectedRoute>
            <ScoresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/winnings"
        element={
          <ProtectedRoute>
            <WinningsPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/draws"
        element={
          <ProtectedRoute adminOnly>
            <AdminDraws />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/charities"
        element={
          <ProtectedRoute adminOnly>
            <AdminCharities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/winners"
        element={
          <ProtectedRoute adminOnly>
            <AdminWinners />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#0f172a',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
