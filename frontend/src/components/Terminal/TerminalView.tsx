import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

const TerminalView = ({ selectedClient, executeCommand }) => {
  const [commandInput, setCommandInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);

  const handleCommandExecution = (cmd) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => [...prev, { type: 'command', text: `[${timestamp}] $ ${cmd}` }]);
    
    executeCommand(cmd).then(response => {
      setTerminalOutput(prev => [...prev, { type: 'output', text: response }]);
    });

    setCommandInput('');
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-slate-400">{selectedClient.name} Terminal</span>
        </div>
      </div>
      <div className="p-4 h-96 overflow-y-auto font-mono text-sm">
        {terminalOutput.map((line, idx) => (
          <div key={idx} className={`mb-1 ${
            line.type === 'command' ? 'text-green-400' :
            line.type === 'output' ? 'text-slate-300' :
            'text-slate-300'
          }`}>
            {line.text}
          </div>
        ))}
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && commandInput && handleCommandExecution(commandInput)}
            className="flex-1 bg-transparent outline-none text-white"
            placeholder="Enter command..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalView;