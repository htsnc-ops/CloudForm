import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface TerminalViewProps {
  selectedClient?: any;
  executeCommand?: any;
}

export const TerminalView: React.FC<TerminalViewProps> = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [output, setOutput] = useState<string[]>([
    'Connected to client terminal',
    '$ Ready for commands...',
  ]);
  const [input, setInput] = useState('');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setOutput([...output, `$ ${input}`, `Command received: ${input}`]);
    setInput('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Terminal - Client {clientId || 'Unknown'}</h2>
      </div>
      <div
        style={{
          background: '#1e1e1e',
          padding: '20px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          minHeight: '500px',
          maxHeight: '70vh',
          overflowY: 'auto',
          color: '#00ff00',
        }}
      >
        {output.map((line, idx) => (
          <div key={idx} style={{ marginBottom: '4px' }}>
            {line}
          </div>
        ))}
        <form onSubmit={handleCommand} style={{ display: 'flex', marginTop: '10px' }}>
          <span style={{ marginRight: '8px' }}>$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#00ff00',
              outline: 'none',
              fontFamily: 'monospace',
              fontSize: '1rem',
            }}
            placeholder="Type a command..."
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default TerminalView;
