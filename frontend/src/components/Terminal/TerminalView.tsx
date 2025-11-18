// @refresh reset
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export const TerminalView: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { cloudProvider = 'azure', name = 'Unknown' } = location.state || {};
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for DOM to be ready
    if (!terminalRef.current) return;

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
    
    // Open terminal in the DOM element
    term.open(terminalRef.current);
    
    // Wait a tick for the terminal to be fully rendered
    setTimeout(() => {
      try {
        fitAddon.fit();
        setIsReady(true);
      } catch (e) {
        console.error('Error fitting terminal:', e);
      }
    }, 0);

    terminalInstanceRef.current = term;

    // Connect to backend WebSocket
    const ws = new WebSocket(`ws://localhost:8080/terminal/${clientId}?provider=${cloudProvider}`);
    
    ws.onopen = () => {
      term.writeln(`Connected to ${name} (${cloudProvider.toUpperCase()})`);
      term.writeln('');
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onerror = () => {
      term.writeln('\r\n\x1b[31mConnection error. Is the backend server running?\x1b[0m');
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (terminalInstanceRef.current) {
        try {
          fitAddon.fit();
        } catch (e) {
          console.error('Error on resize:', e);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
      terminalInstanceRef.current = null;
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