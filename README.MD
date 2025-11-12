# CloudForm - A Cloud Management Platform

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (React Application)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─ HTTP/REST ─────────┐
                   ├─ WebSocket ─────────┤
                   │                     │
┌──────────────────▼─────────────────────▼────────────────────┐
│                     API Gateway/Ingress                      │
│                  (NGINX Ingress Controller)                  │
└──────────────────┬─────────────────────┬────────────────────┘
                   │                     │
         ┌─────────▼─────────┐  ┌────────▼────────┐
         │   Auth Service    │  │  Portal API     │
         │   (Keycloak)      │  │  (Node.js/Go)   │
         └───────────────────┘  └────────┬────────┘
                                         │
                ┌────────────────────────┼────────────────────┐
                │                        │                    │
         ┌──────▼──────┐        ┌───────▼──────┐    ┌───────▼──────┐
         │  Container  │        │   Terminal   │    │   Identity   │
         │  Orchestrator│        │   Service    │    │   Manager    │
         │  (K8s API)  │        │  (WebSocket) │    │  (Vault API) │
         └──────┬──────┘        └───────┬──────┘    └───────┬──────┘
                │                       │                    │
         ┌──────▼──────────────────────▼────────────────────▼──────┐
         │                    Container Pool                        │
         │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
         │  │ Client A │  │ Client B │  │ Client C │  ...         │
         │  │Container │  │Container │  │Container │              │
         │  └──────────┘  └──────────┘  └──────────┘              │
         └──────────────────────────────────────────────────────────┘
```

## 1. Frontend (React)

### Purpose

User interface for client selection and terminal interaction.

### Communication

REST API, WebSocket

## 2. API Gateway (NGINX)

### Purpose

Route traffic, SSL Termination, Rate limiting

### Routes

1. `/api/*` -> Portal API
2. `/ws/*` -> Terminal Service
3. `/auth/*` -> Keycloak
4. `/*` -> Frontend

## 3. Keycloak (Auth)

### Purpose

Identity and access management

### Features

1. User auth
2. RBAC
3. Client Identity Management

### Realms

1. `master`: Admin realm
2. `cloudform`: Application realm

## 4. Portal API Service (Go)

### Endpoints

1. `GET /api/v1/clients` - List all client identities
2. `POST /api/v1/clients` - Create new client identity
3. `GET /api/v1/clients/:id` - Get client details
4. `PUT /api/v1/clients/:id` - Update client identity
5. `DELETE /api/v1/clients/:id` - Delete client identity
6. `POST /api/v1/clients/:id/connect` - Spin up container
7. `DELETE /api/v1/clients/:id/disconnect` - Tear down container
8. `GET /api/v1/clients/:id/status` - Container status

#### Port

8080

## 5. Terminal Service (Node.Js with Socket.io)

### Features

1. WebSocket connection per user session
2. PTY (pseudo-terminal) allocation
3. Command execution in client containers
4. Output streaming
5. Session management

#### Port

8081

## 7. Identity Manager (Vault)

Purpose: Secure credential storage

### Storage

1. Cloud Provider credentials
2. API Keys
3. Service Principal Secrets
4. Encryption keys

## 8. Client Containers

### Base Images

1. Azure: `mcr.microsoft.com/azure-cli`
2. AWS: `amazon/aws-cli`
3. GCP: `google/cloud-sdk`

Features:

Pre-configured cloud CLIs
Credential injection at runtime
Isolated network namespace
Resource limits (CPU/Memory)
Automatic cleanup after timeout

## Data Flow

### Creating a New Client Identity

```
                                → Identity Manager (Vault)
                              /
User → Frontend → Portal API    → Container Orchestrator (K8s)
                              \
                                → Database (PostgreSQL)
```

1. User submits client form
2. Portal API validates input
3. Credentials stored in Vault
4. Container template created in K8s
5. Database record created
6. Response sent to frontend

### Connecting to a Client Terminal

User → Frontend → Terminal Service → Container Orchestrator
                                   → Client Container

1. User selects client
2. WebSocket connection established
3. Terminal Service requests container from orchestrator
4. Container spun up with injected credentials
5. PTY allocated and connected to WebSocket
6. User commands streamed bidirectionally

## Database Schema

### PostgreSQL Tables

```
sql

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cloud_provider VARCHAR(50) NOT NULL,
    auth_type VARCHAR(100) NOT NULL,
    vault_path VARCHAR(500) NOT NULL,
    container_image VARCHAR(255) NOT NULL,
    resource_limits JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Container sessions
CREATE TABLE container_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    user_id UUID REFERENCES users(id),
    container_name VARCHAR(255) NOT NULL,
    pod_name VARCHAR(255) NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    last_activity TIMESTAMP DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    client_id UUID REFERENCES clients(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users (synced from Keycloak)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    roles TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
```

## Security Architecture

### Authentication Flow

#### 1. User Login

   `User → Frontend → Keycloak → JWT Token → Frontend`

#### 2. API Request

   `Frontend (JWT) → API Gateway → Validate Token → Portal API`

#### 3. Container Access

   `Portal API → RBAC Check → Vault (Get Creds) → Container`

## Security Measures

1. Network Policies: Isolate client containers
2. RBAC: Kubernetes role-based access
3. Secrets: Never store credentials in ConfigMaps
4. Vault: Dynamic secret generation
5. TLS: End-to-end encryption
6. Audit: All actions logged
7. Session Timeout: Auto-disconnect idle containers

## Container Template

### Kubernetes Pod Spec

```
yaml

apiVersion: v1
kind: Pod
metadata:
  name: client-{{client-id}}-{{session-id}}
  namespace: htsnc
  labels:
    app: cloudform
    client-id: {{client-id}}
    session-id: {{session-id}}
spec:
  serviceAccountName: cloudform-client
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
  containers:
  - name: cloud-cli
    image: {{client-container-image}}
    command: ["/bin/bash"]
    stdin: true
    tty: true
    env:
    - name: AZURE_CLIENT_ID
      valueFrom:
        secretKeyRef:
          name: client-{{client-id}}-creds
          key: client_id
    - name: AZURE_CLIENT_SECRET
      valueFrom:
        secretKeyRef:
          name: client-{{client-id}}-creds
          key: client_secret
    - name: AZURE_TENANT_ID
      valueFrom:
        secretKeyRef:
          name: client-{{client-id}}-creds
          key: tenant_id
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
    volumeMounts:
    - name: workspace
      mountPath: /workspace
  volumes:
  - name: workspace
    emptyDir: {}
  restartPolicy: Never
  activeDeadlineSeconds: 3600  # 1 hour max
```

## Environment Variables

### Portal API Service

```
bash

# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/cloudportal
DATABASE_POOL_SIZE=10

# Keycloak
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=cloudform
KEYCLOAK_CLIENT_ID=cloudform-api
KEYCLOAK_CLIENT_SECRET=<secret>

# Vault
VAULT_ADDR=http://vault:8200
VAULT_TOKEN=<token>
VAULT_MOUNT_PATH=cloudform

# Kubernetes
KUBERNETES_SERVICE_HOST=kubernetes.default.svc
KUBERNETES_SERVICE_PORT=443
CONTAINER_NAMESPACE=cloudform-containers

# Application
PORT=8080
LOG_LEVEL=info
SESSION_TIMEOUT=3600
MAX_CONTAINERS_PER_USER=5
```

## Terminal Service

```
bash

# WebSocket
WS_PORT=8081
WS_PATH=/ws/terminal

# Kubernetes
KUBERNETES_SERVICE_HOST=kubernetes.default.svc
KUBERNETES_SERVICE_PORT=443

# Authentication
JWT_PUBLIC_KEY_URL=http://keycloak:8080/realms/cloudform/protocol/openid-connect/certs

# Application
LOG_LEVEL=info
HEARTBEAT_INTERVAL=30000
CONNECTION_TIMEOUT=300000
```

## API Examples

### Create Client Identity

```
bash

POST /api/v1/clients
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Client A",
  "cloudProvider": "azure",
  "authType": "service-principal",
  "credentials": {
    "clientId": "xxxxx",
    "clientSecret": "xxxxx",
    "tenantId": "xxxxx",
    "subscriptionId": "xxxxx"
  },
  "resourceLimits": {
    "cpu": "500m",
    "memory": "512Mi"
  }
}

Response:
{
  "id": "uuid",
  "name": "Client A",
  "cloudProvider": "azure",
  "containerImage": "mcr.microsoft.com/azure-cli",
  "status": "ready",
  "createdAt": "2025-11-10T10:00:00Z"
}
```

## Connect to Client Terminal

```
javascript

// WebSocket connection
const ws = new WebSocket('wss://portal.example.com/ws/terminal');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  token: '<jwt-token>',
  clientId: 'uuid'
}));

// Send command
ws.send(JSON.stringify({
  type: 'input',
  data: 'az account list\n'
}));

// Receive output
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'output') {
    console.log(message.data);
  }
};
```

## Monitoring & Observability

### Metrics (Prometheus)

1. `cloudportal_active_containers` - Number of running containers
2. `cloudportal_api_requests_total` - Total API requests
3. `cloudportal_api_request_duration_seconds` - Request latency
4. `cloudportal_websocket_connections` - Active WebSocket connections
5. `cloudportal_container_creation_duration_seconds` - Container spin-up time

### Logs (Loki/ELK)

1. Structured JSON logging
2. Request/response logging
3. Command execution audit
4. Container lifecycle events
5. Authentication events

### Tracing (Jaeger)

1. Distributed tracing across services
2. Request flow visualization
3. Performance bottleneck identification

## Deployment Strategy

### Rolling Update

```
yaml

strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
Health Checks
yamllivenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Scaling Considerations

### Horizontal Pod Autoscaling

```
yaml

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cloudform-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cloudform-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```
