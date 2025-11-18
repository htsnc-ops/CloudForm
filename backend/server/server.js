// server.js
const express = require('express');
const expressWs = require('express-ws');
const k8s = require('@kubernetes/client-node');
const stream = require('stream');

const app = express();
expressWs(app);

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const exec = new k8s.Exec(kc);

// Configuration from your Helm chart
const config = {
  namespace: process.env.CONTAINER_NAMESPACE || 'cloudform-containers',
  images: {
    azure: process.env.AZURE_IMAGE || 'mcr.microsoft.com/azure-cli:latest',
    aws: process.env.AWS_IMAGE || 'amazon/aws-cli:latest',
    gcp: process.env.GCP_IMAGE || 'google/cloud-sdk:latest'
  },
  resources: {
    requests: {
      memory: '256Mi',
      cpu: '250m'
    },
    limits: {
      memory: '512Mi',
      cpu: '500m'
    }
  },
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '3600'),
  idleTimeout: parseInt(process.env.IDLE_TIMEOUT || '900')
};

// Track active sessions for cleanup
const activeSessions = new Map();

// Cleanup idle sessions
setInterval(() => {
  const now = Date.now();
  activeSessions.forEach(async (session, podName) => {
    if (now - session.lastActivity > config.idleTimeout * 1000) {
      console.log(`Cleaning up idle pod: ${podName}`);
      try {
        await k8sApi.deleteNamespacedPod(podName, config.namespace);
        activeSessions.delete(podName);
      } catch (err) {
        console.error('Error deleting idle pod:', err);
      }
    }
  });
}, parseInt(process.env.CLEANUP_INTERVAL || '300') * 1000);

app.ws('/terminal/:clientId', async (ws, req) => {
  const { clientId } = req.params;
  const { provider } = req.query;
  
  if (!config.images[provider]) {
    ws.send(`\x1b[31mUnsupported provider: ${provider}\x1b[0m\r\n`);
    ws.close();
    return;
  }

  const podName = `terminal-${provider}-${clientId}-${Date.now()}`.toLowerCase();
  
  console.log(`Creating pod: ${podName} in namespace: ${config.namespace}`);
  
  // Determine the login command based on provider
  const loginCommands = {
    azure: 'echo "Azure CLI ready. Run \'az login\' to authenticate." && /bin/bash',
    aws: 'echo "AWS CLI ready. Run \'aws configure\' to set up credentials." && /bin/bash',
    gcp: 'echo "GCloud CLI ready. Run \'gcloud init\' to authenticate." && /bin/bash'
  };

  // Create pod manifest
  const podManifest = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: podName,
      namespace: config.namespace,
      labels: {
        app: 'cloudform-terminal',
        clientId: clientId,
        provider: provider,
        createdAt: new Date().toISOString()
      },
      annotations: {
        'cloudform.io/client-id': c