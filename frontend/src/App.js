import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          ☁️ Cloud Portal
        </h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
          Multi-Tenant Cloud Management System
        </p>
        <div style={{ marginTop: '30px', fontSize: '1rem', opacity: 0.8 }}>
          <p>Version 1.0.0</p>
          <p style={{ marginTop: '10px' }}>Service: Ready</p>
        </div>
      </div>
    </div>
  );
}

export default App;