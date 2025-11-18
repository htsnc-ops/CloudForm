const express = require('express');
const expressWs = require('express-ws');
const pty = require('node-pty');
const os = require('os');

const app = express();
expressWs(app);

app.ws('/terminal/:clientId', (ws, req) => {
  const { clientId } = req.params;
  const { provider } = req.query;
  
  console.log(`Terminal connection for client ${clientId}, provider: ${provider}`);
  
  // Determine which shell/CLI to use
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME || process.cwd(),
    env: process.env
  });

  ptyProcess.onData((data) => {
    ws.send(data);
  });

  ws.on('message', (msg) => {
    ptyProcess.write(msg);
  });

  ws.on('close', () => {
    ptyProcess.kill();
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Terminal server running on port ${PORT}`);
});