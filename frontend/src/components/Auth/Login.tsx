import React, { useState } from 'react';

interface LoginProps {
  onLogin: (password: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '40px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          minWidth: '300px',
        }}
      >
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: 'white' }}>
          CloudForm Portal
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '1rem',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#0078D4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
          <p style={{ marginTop: '12px', fontSize: '0.85rem', textAlign: 'center', opacity: 0.7 }}>
            Default: admin123
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
