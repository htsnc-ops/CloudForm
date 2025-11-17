import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useClients } from './hooks/useClients';
import ClientsList from './components/Clients/ClientsList';
import TerminalView from './components/Terminal/TerminalView';
import BrowserView from './components/Browser/BrowserView';
import Login from './components/Auth/Login';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { clients, fetchClients } = useClients();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleLogin = (password: string) => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
  };

  return (
    <Router>
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
    </Router>
  );
};

export default App;