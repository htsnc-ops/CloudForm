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

Purpose: User interface for client selection and terminal interaction.
Communication: REST API, WebSocket

## 2. API Gateway (NGINX)

Purpose: Route traffic, SSL Termination, Rate limiting

Routes:

1. `/api/*` -> Portal API
2. `/ws/*` -> Terminal Service
3. `/auth/*` -> Keycloak
4. `/*` -> Frontend

## 3. Keycloak (Auth)

Purpose: Identity and access management

Features:

1. User auth
2. RBAC
3. Client Identity Management

Realms:
`master`: Admin realm
`cloud-portal`: Application realm

## 4. Portal API Service (Go)

Port 8080

Endpoints:

1. `GET /api/v1/clients` - List all client identities
2. `POST /api/v1/clients` - Create new client identity
3. `GET /api/v1/clients/:id` - Get client details
4. `PUT /api/v1/clients/:id` - Update client identity
5. `DELETE /api/v1/clients/:id` - Delete client identity
6. `POST /api/v1/clients/:id/connect` - Spin up container
7. `DELETE /api/v1/clients/:id/disconnect` - Tear down container
8. `GET /api/v1/clients/:id/status` - Container status

## 5. Terminal Service (Node.Js with Socket.io)

Port 8081

Features:

1. WebSocket connection per user session
2. PTY (pseudo-terminal) allocation
3. Command execution in client containers
4. Output streaming
5. Session management
