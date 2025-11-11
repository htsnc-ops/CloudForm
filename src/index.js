// ============================================================================
// Portal API Service - Main Entry Point
// ============================================================================
// src/index.js

const express = require('express');
const { createServer } = require('http');
const { Pool } = require('pg');
const k8s = require('@kubernetes/client-node');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const axios = require('axios');

// Initialize Express
const app = express();
const server = createServer(app);

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
});

// Kubernetes client
const kc = new k8s.KubeConfig();
kc.loadFromCluster();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// Vault client
const vaultUrl = process.env.VAULT_ADDR || 'http://vault:8200';
const vaultToken = process.env.VAULT_TOKEN;

// Keycloak JWKS client
const jwks = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`
});

// ============================================================================
// Middleware
// ============================================================================

// JWT verification middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.decode(token, { complete: true });
    const key = await jwks.getSigningKey(decoded.header.kid);
    const signingKey = key.getPublicKey();

    const verified = jwt.verify(token, signingKey, {
      algorithms: ['RS256']
    });

    req.user = verified;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// RBAC middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    const userRoles = req.user.realm_access?.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Audit logging middleware
const auditLog = async (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    
    try {
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          req.user?.sub,
          `${req.method} ${req.path}`,
          JSON.stringify({ body: req.body, params: req.params, duration }),
          req.ip,
          req.headers['user-agent']
        ]
      );
    } catch (error) {
      console.error('Audit log failed:', error);
    }
  });
  
  next();
};

// ============================================================================
// Vault Functions
// ============================================================================

async function storeCredentials(clientId, credentials) {
  try {
    const response = await axios.post(
      `${vaultUrl}/v1/cloudform/data/${clientId}`,
      { data: credentials },
      { headers: { 'X-Vault-Token': vaultToken } }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to store credentials in Vault:', error);
    throw new Error('Failed to store credentials');
  }
}

async function getCredentials(clientId) {
  try {
    const response = await axios.get(
      `${vaultUrl}/v1/cloudform/data/${clientId}`,
      { headers: { 'X-Vault-Token': vaultToken } }
    );
    return response.data.data.data;
  } catch (error) {
    console.error('Failed to retrieve credentials from Vault:', error);
    throw new Error('Failed to retrieve credentials');
  }
}

async function deleteCredentials(clientId) {
  try {
    await axios.delete(
      `${vaultUrl}/v1/cloudform/data/${clientId}`,
      { headers: { 'X-Vault-Token': vaultToken } }
    );
  } catch (error) {
    console.error('Failed to delete credentials from Vault:', error);
  }
}

// ============================================================================
// Container Management Functions
// ============================================================================

async function createClientContainer(client, userId) {
  const namespace = process.env.CONTAINER_NAMESPACE;
  const sessionId = Date.now().toString();
  const podName = `client-${client.id}-${sessionId}`;
  
  // Get credentials from Vault
  const credentials = await getCredentials(client.id);
  
  // Create secret for credentials
  const secretName = `creds-${client.id}-${sessionId}`;
  const secretManifest = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: secretName,
      namespace: namespace,
      labels: {
        'app.kubernetes.io/name': 'cloudform',
        'app.kubernetes.io/component': 'container-runtime',
        'client-id': client.id,
        'session-id': sessionId
      }
    },
    type: 'Opaque',
    stringData: credentials
  };
  
  await k8sApi.createNamespacedSecret(namespace, secretManifest);
  
  // Create pod
  const podManifest = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: podName,
      namespace: namespace,
      labels: {
        'app.kubernetes.io/name': 'cloudform',
        'app.kubernetes.io/component': 'container-runtime',
        'client-id': client.id,
        'session-id': sessionId,
        'user-id': userId
      }
    },
    spec: {
      serviceAccountName: 'cloudform-client',
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 1000,
        fsGroup: 1000
      },
      containers: [{
        name: 'cloud-cli',
        image: client.container_image,
        command: ['/bin/bash'],
        stdin: true,
        tty: true,
        env: Object.keys(credentials).map(key => ({
          name: key.toUpperCase(),
          valueFrom: {
            secretKeyRef: {
              name: secretName,
              key: key
            }
          }
        })),
        resources: JSON.parse(client.resource_limits || '{}'),
        volumeMounts: [{
          name: 'workspace',
          mountPath: '/workspace'
        }]
      }],
      volumes: [{
        name: 'workspace',
        emptyDir: {}
      }],
      restartPolicy: 'Never',
      activeDeadlineSeconds: 3600
    }
  };
  
  const pod = await k8sApi.createNamespacedPod(namespace, podManifest);
  
  // Store session in database
  await pool.query(
    `INSERT INTO container_sessions 
     (client_id, user_id, container_name, pod_name, namespace, status, started_at, last_activity)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [client.id, userId, secretName, podName, namespace, 'running']
  );
  
  return {
    sessionId,
    podName,
    namespace,
    status: 'created'
  };
}

async function deleteClientContainer(sessionId) {
  const namespace = process.env.CONTAINER_NAMESPACE;
  
  // Get session from database
  const result = await pool.query(
    'SELECT * FROM container_sessions WHERE id = $1',
    [sessionId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Session not found');
  }
  
  const session = result.rows[0];
  
  // Delete pod
  try {
    await k8sApi.deleteNamespacedPod(session.pod_name, namespace);
  } catch (error) {
    console.error('Failed to delete pod:', error);
  }
  
  // Delete secret
  try {
    await k8sApi.deleteNamespacedSecret(session.container_name, namespace);
  } catch (error) {
    console.error('Failed to delete secret:', error);
  }
  
  // Update database
  await pool.query(
    'UPDATE container_sessions SET status = $1, ended_at = NOW() WHERE id = $2',
    ['terminated', sessionId]
  );
  
  return { status: 'deleted' };
}

async function cleanupIdleContainers() {
  const idleTimeout = parseInt(process.env.IDLE_TIMEOUT || '900'); // 15 minutes
  
  const result = await pool.query(
    `SELECT * FROM container_sessions 
     WHERE status = 'running' 
     AND last_activity < NOW() - INTERVAL '${idleTimeout} seconds'`
  );
  
  for (const session of result.rows) {
    console.log(`Cleaning up idle session: ${session.id}`);
    await deleteClientContainer(session.id);
  }
}

// ============================================================================
// API Routes
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Readiness check
app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// Protected routes
app.use('/api', verifyToken, auditLog);

// List all clients
app.get('/api/v1/clients', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, cloud_provider, auth_type, container_image, 
              resource_limits, created_at, updated_at
       FROM clients
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
app.get('/api/v1/clients/:id', requireRole(['admin', 'operator', 'viewer']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create client
app.post('/api/v1/clients', requireRole(['admin']), async (req, res) => {
  const { name, cloudProvider, authType, credentials, resourceLimits } = req.body;
  
  try {
    // Validate input
    if (!name || !cloudProvider || !credentials) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Determine container image
    const imageMap = {
      azure: 'mcr.microsoft.com/azure-cli:latest',
      aws: 'amazon/aws-cli:latest',
      gcp: 'google/cloud-sdk:latest'
    };
    const containerImage = imageMap[cloudProvider];
    
    if (!containerImage) {
      return res.status(400).json({ error: 'Invalid cloud provider' });
    }
    
    // Insert into database
    const result = await pool.query(
      `INSERT INTO clients 
       (name, cloud_provider, auth_type, vault_path, container_image, resource_limits, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        cloudProvider,
        authType,
        `cloudform/${Date.now()}`,
        containerImage,
        JSON.stringify(resourceLimits || {}),
        req.user.sub
      ]
    );
    
    const client = result.rows[0];
    
    // Store credentials in Vault
    await storeCredentials(client.id, credentials);
    
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
app.put('/api/v1/clients/:id', requireRole(['admin']), async (req, res) => {
  const { name, credentials, resourceLimits } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE clients 
       SET name = COALESCE($1, name),
           resource_limits = COALESCE($2, resource_limits),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, JSON.stringify(resourceLimits), req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Update credentials if provided
    if (credentials) {
      await storeCredentials(req.params.id, credentials);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
app.delete('/api/v1/clients/:id', requireRole(['admin']), async (req, res) => {
  try {
    // Delete credentials from Vault
    await deleteCredentials(req.params.id);
    
    // Delete from database
    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Connect to client (create container)
app.post('/api/v1/clients/:id/connect', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    const client = result.rows[0];
    const session = await createClientContainer(client, req.user.sub);
    
    res.json(session);
  } catch (error) {
    console.error('Error connecting to client:', error);
    res.status(500).json({ error: 'Failed to connect to client' });
  }
});

// Disconnect from client (delete container)
app.delete('/api/v1/clients/:id/disconnect', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    const result = await deleteClientContainer(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error disconnecting from client:', error);
    res.status(500).json({ error: 'Failed to disconnect from client' });
  }
});

// Get client status
app.get('/api/v1/clients/:id/status', requireRole(['admin', 'operator', 'viewer']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM container_sessions 
       WHERE client_id = $1 AND status = 'running'
       ORDER BY started_at DESC`,
      [req.params.id]
    );
    
    res.json({
      clientId: req.params.id,
      activeSessions: result.rows.length,
      sessions: result.rows
    });
  } catch (error) {
    console.error('Error fetching client status:', error);
    res.status(500).json({ error: 'Failed to fetch client status' });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const activeContainers = await pool.query(
      "SELECT COUNT(*) as count FROM container_sessions WHERE status = 'running'"
    );
    
    const metrics = `
# HELP cloudportal_active_containers Number of active client containers
# TYPE cloudportal_active_containers gauge
cloudportal_active_containers ${activeContainers.rows[0].count}

# HELP cloudportal_api_uptime_seconds API uptime in seconds
# TYPE cloudportal_api_uptime_seconds counter
cloudportal_api_uptime_seconds ${process.uptime()}
    `.trim();
    
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).send('Error generating metrics');
  }
});

// ============================================================================
// Background Jobs
// ============================================================================

// Cleanup idle containers every 5 minutes
setInterval(cleanupIdleContainers, 5 * 60 * 1000);

// ============================================================================
// Start Server
// ============================================================================

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Portal API server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    pool.end();
    process.exit(0);
  });
});