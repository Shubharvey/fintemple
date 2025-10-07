import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 👇 ADD THIS IMPORT - Google OAuth Provider
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider, useAuth } from "./hooks/useAuth";
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

// 👇 ADD THIS - Your Google Client ID from Google Cloud Console
// Replace "YOUR_GOOGLE_CLIENT_ID_HERE" with your actual Client ID
const GOOGLE_CLIENT_ID =
  "672076840589-inilsqadhthidpshvbjj1sihn2gsanb9.apps.googleusercontent.com";

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
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

// 👇 UPDATE THIS FUNCTION - Wrap with GoogleOAuthProvider
function App() {
  return (
    // 👇 WRAP YOUR EXISTING APP WITH GoogleOAuthProvider
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
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
      </AuthProvider>
      {/* 👇 CLOSE THE GoogleOAuthProvider */}
    </GoogleOAuthProvider>
  );
}

export default App;
