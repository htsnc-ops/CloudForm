import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useClients } from './hooks/useClients';
import ClientsList from './components/Clients/ClientsList';
import TerminalView from './components/Terminal/TerminalView';
import BrowserView from './components/Browser/BrowserView';
import Login from './components/Auth/Login';

// Inner component that can use useNavigate
const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { clients, fetchClients } = useClients();
  const navigate = useNavigate(); // Now this works because we're inside <Router>

  const handleLogin = (password: string) => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      navigate('/clients'); // Now this works!
    } else {
      alert('Invalid password');
    }
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terminal/:clientId"
          element={
            <ProtectedRoute>
              <TerminalView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browser/:clientId"
          element={
            <ProtectedRoute>
              <BrowserView />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

// Outer component that provides the Router
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;