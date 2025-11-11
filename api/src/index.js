const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'portal-api',
    timestamp: new Date().toISOString()
  });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    service: 'portal-api'
  });
});

// API routes
app.get('/api/v1/clients', (req, res) => {
  // Placeholder - will connect to database
  res.json([
    {
      id: '1',
      name: 'Demo Client A',
      cloudProvider: 'azure',
      status: 'ready'
    }
  ]);
});

app.post('/api/v1/clients', (req, res) => {
  // Placeholder - will create client
  res.status(201).json({
    id: Date.now().toString(),
    ...req.body,
    status: 'created'
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = `
# HELP cloudportal_api_uptime_seconds API uptime in seconds
# TYPE cloudportal_api_uptime_seconds counter
cloudportal_api_uptime_seconds ${process.uptime()}

# HELP cloudportal_api_requests_total Total number of API requests
# TYPE cloudportal_api_requests_total counter
cloudportal_api_requests_total 0
  `.trim();
  
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portal API listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});