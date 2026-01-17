import { useState, useEffect } from 'react';
import SocietySelect from './components/Auth/SocietySelect';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Navbar from './components/Common/Navbar';

export default function App() {
  const [screen, setScreen] = useState('society'); // society, auth, dashboard
  const [authMode, setAuthMode] = useState('login'); // login, signup
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    const storedSociety = localStorage.getItem('society');

    if (storedUser && storedSociety) {
      setUser(JSON.parse(storedUser));
      setSelectedSociety(JSON.parse(storedSociety));
      setScreen('dashboard');
    }
  }, []);

  const handleSocietySelect = (society) => {
    setSelectedSociety(society);
    setScreen('auth');
    setAuthMode('login');
  };

  const handleAuthSwitch = (mode) => {
    setAuthMode(mode);
  };

  const handleSignupSuccess = () => {
    setAuthMode('login');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedSociety(null);
    setScreen('society');
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {screen === 'society' && (
        <SocietySelect onSelect={handleSocietySelect} />
      )}

      {screen === 'auth' && selectedSociety && (
        <div>
          {screen === 'auth' && selectedSociety && (
  <div>
    {authMode === 'login' && (
      <Login
        society={selectedSociety}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => handleAuthSwitch('signup')}
      />
    )}

    {authMode === 'signup' && (
      <SignUp
        society={selectedSociety}
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={() => handleAuthSwitch('login')}
      />
    )}
  </div>
)}

        </div>
      )}

      {screen === 'dashboard' && user && selectedSociety && (
        <>
          <Navbar
            user={user}
            society={selectedSociety}
            onLogout={handleLogout}
          />
          <Dashboard user={user} society={selectedSociety} />
        </>
      )}
    </div>
  );
}
