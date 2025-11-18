// TerminalView.tsx
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export const TerminalView: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { cloudProvider = 'azure', name = 'Unknown' } = location.state || {};

  useEffect(() => {
    if (!terminalRef.current) return;

    // Cleanup existing instances
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.dispose();
      terminalInstanceRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: cloudProvider === 'azure' ? '#00d4ff' : 
                    cloudProvider === 'aws' ? '#ff9900' : '#4285f4'
      },
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      rows: 30,
      cols: 80
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.error('Error fitting terminal:', e);
      }
    }, 10);

    terminalInstanceRef.current = term;

    // Get WebSocket URL from environment or default
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.REACT_APP_BACKEND_WS_HOST || window.location.hostname;
    const wsPort = process.env.REACT_APP_BACKEND_WS_PORT || '8080';
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/terminal/${clientId}?provider=${cloudProvider}`;

    term.writeln(`\x1b[33mConnecting to ${cloudProvider.toUpperCase()} CLI...\x1b[0m`);
    term.writeln(`\x1b[90mClient: ${name}\x1b[0m`);
    term.writeln('');

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      term.writeln(`\x1b[32m✓ Connected\x1b[0m`);
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      term.writeln('\r\n\x1b[31m✗ Connection error. Make sure the backend is running.\x1b[0m');
    };

    ws.onclose = () => {
      term.writeln('\r\n\x1b[33m✗ Connection closed. Terminal container will be cleaned up.\x1b[0m');
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        // Ignore resize errors
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
      }
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
        <span style={{ 
          padding: '4px 12px', 
          borderRadius: '6px', 
          background: cloudProvider === 'azure' ? '#0078D4' : 
                      cloudProvider === 'aws' ? '#FF9900' : '#4285F4',
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          {cloudProvider.toUpperCase()}
        </span>
      </div>
      <div 
        ref={terminalRef} 
        key={`terminal-${clientId}`}
        style={{ 
          height: '600px',
          width: '100%',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '10px',
          boxSizing: 'border-box'
        }} 
      />
    </div>
  );
};

export default TerminalView;