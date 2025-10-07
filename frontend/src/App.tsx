import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Google OAuth Provider
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider, useAuth } from "./hooks/useAuth";
import { LoadingProvider, useLoading } from "./contexts/LoadingContext";
import LoadingScreen from "./components/Loading/LoadingScreen";
import Layout from "./components/Layout/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Reports from "./pages/Reports";
import NewTrade from "./pages/NewTrade";
import Import from "./pages/Import";
import Calendar from "./pages/Calendar";

// Your Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID =
  "672076840589-inilsqadhthidpshvbjj1sihn2gsanb9.apps.googleusercontent.com";

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const { isLoading } = useLoading();

  if (loading) {
    return <LoadingScreen text="Authenticating user..." />;
  }

  // Only show global loading screen if it's a global loading operation
  // and not during authentication
  if (isLoading && !loading) {
    return <LoadingScreen />;
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { isLoading } = useLoading();

  if (loading) {
    return <LoadingScreen text="Authenticating user..." />;
  }

  // Only show global loading screen if it's a global loading operation
  // and not during authentication
  if (isLoading && !loading) {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

// Search component (protected version of landing page or dedicated search page)
const Search: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Search</h1>
      <p className="text-slate-300">Search functionality coming soon...</p>
    </div>
  );
};

// Journal component
const Journal: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Trading Journal</h1>
      <p className="text-slate-300">Journal page content coming soon...</p>
    </div>
  );
};

// Community component
const Community: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Adam Lee Plan - Gold</h1>
      <p className="text-slate-300">Community features coming soon...</p>
    </div>
  );
};

// App content component that uses the loading context
const AppContent: React.FC = () => {
  const [initialLoading, setInitialLoading] = useState(true);

  // Simulate initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000); // 2 seconds initial loading

    return () => clearTimeout(timer);
  }, []);

  // Show initial loading screen
  if (initialLoading) {
    return <LoadingScreen text="Initializing FinTemple..." />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trades"
          element={
            <ProtectedRoute>
              <Trades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-trade"
          element={
            <ProtectedRoute>
              <NewTrade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/import"
          element={
            <ProtectedRoute>
              <Import />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Journal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

// Main App component with all providers
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoadingProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LoadingProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
