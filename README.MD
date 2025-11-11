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
2. `cloud-portal`: Application realm

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
