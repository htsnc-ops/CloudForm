import React, { useState, useEffect } from 'react';
import { Cloud, Terminal, Globe, Plus, Settings, LogOut, Users, Key } from 'lucide-react';

const CloudPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [commandInput, setCommandInput] = useState('');
  const [activeView, setActiveView] = useState('clients'); // clients, terminal, browser

  // Load clients from storage
  useEffect(() => {
    const loadClients = async () => {
      try {
        const result = await window.storage.get('cloud-portal-clients');
        if (result) {
          setClients(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No existing clients found');
      }
    };
    loadClients();
  }, []);

  // Save clients to storage
  const saveClients = async (updatedClients) => {
    try {
      await window.storage.set('cloud-portal-clients', JSON.stringify(updatedClients));
      setClients(updatedClients);
    } catch (error) {
      console.error('Failed to save clients:', error);
    }
  };

  const handleLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const [newClientData, setNewClientData] = useState({
    clientName: '',
    cloudProvider: 'azure',
    authType: 'service-principal',
    clientId: '',
    clientSecret: '',
    tenantId: '',
    subscriptionId: ''
  });

  const handleAddClient = async () => {
    if (!newClientData.clientName) {
      alert('Please enter a client name');
      return;
    }

    const newClient = {
      id: Date.now().toString(),
      name: newClientData.clientName,
      cloudProvider: newClientData.cloudProvider,
      credentials: {
        type: newClientData.authType,
        clientId: newClientData.clientId,
        clientSecret: newClientData.clientSecret,
        tenantId: newClientData.tenantId,
        subscriptionId: newClientData.subscriptionId
      },
      containerEndpoint: `https://container-${Date.now()}.local:8443`,
      createdAt: new Date().toISOString()
    };

    const updatedClients = [...clients, newClient];
    await saveClients(updatedClients);
    setShowAddClient(false);
    setNewClientData({
      clientName: '',
      cloudProvider: 'azure',
      authType: 'service-principal',
      clientId: '',
      clientSecret: '',
      tenantId: '',
      subscriptionId: ''
    });
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setActiveView('terminal');
    setTerminalOutput([
      { type: 'system', text: `Connected to ${client.name} environment` },
      { type: 'system', text: `Cloud Provider: ${client.cloudProvider}` },
      { type: 'system', text: `Container: ${client.containerEndpoint}` },
      { type: 'info', text: 'Terminal ready. Type "help" for available commands.' }
    ]);
  };

  const executeCommand = (cmd) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => [...prev, { type: 'command', text: `[${timestamp}] $ ${cmd}` }]);

    // Simulate command execution
    setTimeout(() => {
      let response = '';
      const lowerCmd = cmd.toLowerCase();

      if (lowerCmd === 'help') {
        response = `Available commands:
  help              - Show this help message
  status            - Check connection status
  ls                - List resources
  ${selectedClient.cloudProvider === 'azure' ? 'az' : selectedClient.cloudProvider === 'aws' ? 'aws' : 'gcloud'} [args]  - Execute native CLI commands
  clear             - Clear terminal
  exit              - Disconnect from client`;
      } else if (lowerCmd === 'status') {
        response = `✓ Connected to ${selectedClient.name}
✓ Identity: ${selectedClient.credentials.clientId || selectedClient.credentials.accessKey || 'Service Account'}
✓ Provider: ${selectedClient.cloudProvider}
✓ Container Status: Running`;
      } else if (lowerCmd === 'ls') {
        response = `Resources for ${selectedClient.name}:
- Virtual Machines: 3
- Storage Accounts: 5
- Networks: 2
- Databases: 1`;
      } else if (lowerCmd === 'clear') {
        setTerminalOutput([]);
        return;
      } else if (lowerCmd === 'exit') {
        setSelectedClient(null);
        setActiveView('clients');
        return;
      } else if (lowerCmd.startsWith('az ') || lowerCmd.startsWith('aws ') || lowerCmd.startsWith('gcloud ')) {
        response = `Executing command in ${selectedClient.name} container...
[Simulated output - In production, this would execute via container API]
Command: ${cmd}
Status: Success`;
      } else {
        response = `Command not recognized: ${cmd}. Type "help" for available commands.`;
      }

      setTerminalOutput(prev => [...prev, { type: 'output', text: response }]);
    }, 300);

    setCommandInput('');
  };

  const openBrowser = () => {
    let url = '';
    switch (selectedClient.cloudProvider) {
      case 'azure':
        url = 'https://portal.azure.com';
        break;
      case 'aws':
        url = 'https://console.aws.amazon.com';
        break;
      case 'gcp':
        url = 'https://console.cloud.google.com';
        break;
    }
    setActiveView('browser');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <Cloud className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Cloud Portal</h1>
          <p className="text-slate-400 text-center mb-6">Multi-Tenant Management System</p>
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
            <p className="text-xs text-slate-500 text-center mt-4">Default password: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cloud className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Cloud Management Portal</h1>
              {selectedClient && (
                <p className="text-sm text-slate-400">Connected: {selectedClient.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {selectedClient && (
              <>
                <button
                  onClick={() => setActiveView('terminal')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeView === 'terminal' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>Terminal</span>
                </button>
                <button
                  onClick={openBrowser}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeView === 'browser' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Browser</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                setSelectedClient(null);
                setActiveView('clients');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Clients</span>
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeView === 'clients' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Client Identities</h2>
              <button
                onClick={() => setShowAddClient(!showAddClient)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Client</span>
              </button>
            </div>

            {showAddClient && (
              <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Add New Client Identity</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Client Name</label>
                      <input
                        value={newClientData.clientName}
                        onChange={(e) => setNewClientData({...newClientData, clientName: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Client A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Cloud Provider</label>
                      <select
                        value={newClientData.cloudProvider}
                        onChange={(e) => setNewClientData({...newClientData, cloudProvider: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="azure">Microsoft Azure</option>
                        <option value="aws">Amazon AWS</option>
                        <option value="gcp">Google Cloud Platform</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Authentication Type</label>
                    <select
                      value={newClientData.authType}
                      onChange={(e) => setNewClientData({...newClientData, authType: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="service-principal">Service Principal (Azure)</option>
                      <option value="iam-role">IAM Role (AWS)</option>
                      <option value="service-account">Service Account (GCP)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Client ID / Access Key</label>
                      <input
                        value={newClientData.clientId}
                        onChange={(e) => setNewClientData({...newClientData, clientId: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter client ID or access key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Client Secret / Secret Key</label>
                      <input
                        value={newClientData.clientSecret}
                        onChange={(e) => setNewClientData({...newClientData, clientSecret: e.target.value})}
                        type="password"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter secret"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tenant ID (Azure)</label>
                      <input
                        value={newClientData.tenantId}
                        onChange={(e) => setNewClientData({...newClientData, tenantId: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subscription / Project ID</label>
                      <input
                        value={newClientData.subscriptionId}
                        onChange={(e) => setNewClientData({...newClientData, subscriptionId: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleAddClient}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                    >
                      Create Client Identity
                    </button>
                    <button
                      onClick={() => setShowAddClient(false)}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map(client => (
                <div
                  key={client.id}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => selectClient(client)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Cloud className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{client.name}</h3>
                        <p className="text-sm text-slate-400">{client.cloudProvider.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Key className="w-4 h-4" />
                      <span>{client.credentials.type}</span>
                    </div>
                    <div className="text-slate-500 text-xs">
                      Created: {new Date(client.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {clients.length === 0 && !showAddClient && (
              <div className="text-center py-12 text-slate-400">
                <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No client identities configured</p>
                <p className="text-sm">Click "Add Client" to create your first identity</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'terminal' && selectedClient && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-4 text-sm text-slate-400">
                  {selectedClient.name} Terminal - {selectedClient.cloudProvider}
                </span>
              </div>
            </div>
            <div className="p-4 h-96 overflow-y-auto font-mono text-sm">
              {terminalOutput.map((line, idx) => (
                <div key={idx} className={`mb-1 ${
                  line.type === 'command' ? 'text-green-400' :
                  line.type === 'system' ? 'text-blue-400' :
                  line.type === 'info' ? 'text-yellow-400' :
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
                  onKeyPress={(e) => e.key === 'Enter' && commandInput && executeCommand(commandInput)}
                  className="flex-1 bg-transparent outline-none text-white"
                  placeholder="Enter command..."
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {activeView === 'browser' && selectedClient && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="bg-slate-900 px-4 py-3 flex items-center space-x-4 border-b border-slate-700">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-400">
                {selectedClient.cloudProvider === 'azure' ? 'portal.azure.com' :
                 selectedClient.cloudProvider === 'aws' ? 'console.aws.amazon.com' :
                 'console.cloud.google.com'}
              </span>
            </div>
            <div className="p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 mb-4">
                  In production, this would open an authenticated browser session
                </p>
                <p className="text-sm text-slate-500">
                  The container would handle SSO/authentication automatically
                </p>
                <a
                  href={selectedClient.cloudProvider === 'azure' ? 'https://portal.azure.com' :
                        selectedClient.cloudProvider === 'aws' ? 'https://console.aws.amazon.com' :
                        'https://console.cloud.google.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudPortal;