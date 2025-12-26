import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';

// Pages
import SetupWizard from './pages/Setup/SetupWizard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Feed from './pages/Feed/Feed';
import Profile from './pages/Profile/Profile';
import Groups from './pages/Groups/Groups';
import Messages from './pages/Messages/Messages';
import Notifications from './pages/Notifications/Notifications';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppContent() {
  const [isConfigured, setIsConfigured] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await axios.get('/api/setup/status');
      setIsConfigured(response.data.configured);
    } catch (error) {
      console.error('Error checking configuration:', error);
      setIsConfigured(false);
    }
  };

  if (isConfigured === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupWizard onComplete={() => setIsConfigured(true)} />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      
      {/* Protected routes */}
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}>
        <Route index element={<Feed />} />
        <Route path="profile/:userId" element={<Profile />} />
        <Route path="groups" element={<Groups />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
