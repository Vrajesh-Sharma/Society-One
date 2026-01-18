import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SocietySelect from './components/Auth/SocietySelect';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white font-medium text-lg">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, user, society, loading }) {
  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !society) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Auth Route Component (redirect if already logged in)
function AuthRoute({ children, user, society, loading }) {
  if (loading) {
    return <LoadingScreen />;
  }

  if (user && society) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default function App() {
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and society from localStorage
    const storedUser = localStorage.getItem('user');
    const storedSociety = localStorage.getItem('society');

    if (storedUser && storedSociety) {
      try {
        setUser(JSON.parse(storedUser));
        setSelectedSociety(JSON.parse(storedSociety));
      } catch (err) {
        console.error('Failed to parse stored data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('society');
      }
    }
    
    setLoading(false);
  }, []);

  const handleSocietySelect = (society) => {
    setSelectedSociety(society);
  };

  const handleSignupSuccess = () => {
    // Will be redirected by Login component
  };

  const handleLoginSuccess = (userData, societyData) => {
    setUser(userData);
    setSelectedSociety(societyData);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedSociety(null);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <AuthRoute user={user} society={selectedSociety} loading={loading}>
              <SocietySelect onSelect={handleSocietySelect} />
            </AuthRoute>
          }
        />

        <Route
          path="/login"
          element={
            <AuthRoute user={user} society={selectedSociety} loading={loading}>
              {selectedSociety ? (
                <Login
                  society={selectedSociety}
                  onLoginSuccess={handleLoginSuccess}
                />
              ) : (
                <Navigate to="/" replace />
              )}
            </AuthRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <AuthRoute user={user} society={selectedSociety} loading={loading}>
              {selectedSociety ? (
                <SignUp
                  society={selectedSociety}
                  onSignupSuccess={handleSignupSuccess}
                />
              ) : (
                <Navigate to="/" replace />
              )}
            </AuthRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} society={selectedSociety} loading={loading}>
              <Dashboard
                user={user}
                society={selectedSociety}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute user={user} society={selectedSociety} loading={loading}>
              <Dashboard
                user={user}
                society={selectedSociety}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notices"
          element={
            <ProtectedRoute user={user} society={selectedSociety} loading={loading}>
              <Dashboard
                user={user}
                society={selectedSociety}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaints"
          element={
            <ProtectedRoute user={user} society={selectedSociety} loading={loading}>
              <Dashboard
                user={user}
                society={selectedSociety}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* Fallback - redirect to profile if logged in, otherwise to home */}
        <Route
          path="*"
          element={
            user && selectedSociety ? (
              <Navigate to="/profile" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute user={user} society={selectedSociety} loading={loading}>
              <Dashboard
                user={user}
                society={selectedSociety}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
