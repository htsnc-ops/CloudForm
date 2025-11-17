import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ClientsList from './components/Clients/ClientsList';
import TerminalView from './components/Terminal/TerminalView';
import BrowserView from './components/Browser/BrowserView';
import Login from './components/Auth/Login';
import { useClients } from './hooks/useClients';
import './styles/index.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { clients, loadClients } = useClients();

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <Switch>
          <Route path="/login">
            <Login onLogin={handleLogin} />
          </Route>
          <Route path="/clients">
            {isAuthenticated ? <ClientsList clients={clients} /> : <Login onLogin={handleLogin} />}
          </Route>
          <Route path="/terminal">
            {isAuthenticated ? <TerminalView /> : <Login onLogin={handleLogin} />}
          </Route>
          <Route path="/browser">
            {isAuthenticated ? <BrowserView /> : <Login onLogin={handleLogin} />}
          </Route>
          <Route path="/">
            <Login onLogin={handleLogin} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;