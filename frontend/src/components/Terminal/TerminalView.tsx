import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export const TerminalView: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { cloudProvider = 'azure', name = 'Unknown' } = location.state || {};

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: cloudProvider === 'azure' ? '#00d4ff' : 
                    cloudProvider === 'aws' ? '#ff9900' : '#4285f4'
      },
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace'
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // Connect to backend WebSocket
    const ws = new WebSocket(`ws://localhost:8080/terminal/${clientId}?provider=${cloudProvider}`);
    
    ws.onopen = () => {
      term.writeln(`Connected to ${name} (${cloudProvider.toUpperCase()})`);
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onerror = () => {
      term.writeln('\r\n\x1b[31mConnection error. Is the backend server running?\x1b[0m');
    };

    term.onData((data) => {
      ws.send(data);
    });

    return () => {
      ws.close();
      term.dispose();
    };
  }, [clientId, cloudProvider, name]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/clients')}
          style={{
            padding: '8px 16px',
            background: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ← Back to Clients
        </button>
        <h2>Terminal - {name}</h2>
      </div>
      <div 
        ref={terminalRef} 
        style={{ 
          height: '600px',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '10px'
        }} 
      />
    </div>
  );
};

export default TerminalView;