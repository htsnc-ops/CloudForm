const express = require('express');
const { WebSocketServer } = require('ws');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/terminal' });

const PORT = process.env.WS_PORT || 8081;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'terminal-service',
    timestamp: new Date().toISOString()
  });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    service: 'terminal-service',
    activeConnections: wss.clients.size
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = `
# HELP cloudportal_websocket_connections Active WebSocket connections
# TYPE cloudportal_websocket_connections gauge
cloudportal_websocket_connections ${wss.clients.size}

# HELP cloudportal_terminal_uptime_seconds Terminal service uptime
# TYPE cloudportal_terminal_uptime_seconds counter
cloudportal_terminal_uptime_seconds ${process.uptime()}
  `.trim();
  
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection from:', req.socket.remoteAddress);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Connected to Cloud Portal Terminal Service',
    timestamp: new Date().toISOString()
  }));
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received:', message);
      
      if (message.type === 'auth') {
        // Validate token (placeholder)
        ws.send(JSON.stringify({
          type: 'auth',
          status: 'authenticated',
          clientId: message.clientId
        }));
      } else if (message.type === 'input') {
        // Echo back (placeholder - will execute in container)
        ws.send(JSON.stringify({
          type: 'output',
          data: `Received command: ${message.data}`
        }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  // Heartbeat
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);
  
  ws.on('close', () => clearInterval(heartbeat));
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Terminal Service listening on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws/terminal`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});