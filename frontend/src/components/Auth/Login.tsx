import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../../services/api';

const Login = () => {
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { password: adminPassword });
      if (response.data.success) {
        // Redirect to the dashboard or main application view
        history.push('/dashboard');
      } else {
        setErrorMessage('Invalid password. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An error occurred during login. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Login</h1>
        <p className="text-slate-400 text-center mb-6">Access your cloud management portal</p>
        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin password"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;