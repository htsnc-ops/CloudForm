Cloud Portal Deployment Guide
Prerequisites
Required Tools
bash# Kubernetes cluster (1.24+)
kubectl version --short

# Helm 3.x
helm version

# Docker (for building images)
docker version
Required Infrastructure

Kubernetes cluster with at least 3 worker nodes
50GB+ storage available
Ingress controller (NGINX recommended)
Cert-manager for SSL certificates
Metrics server for HPA

Installation Steps
1. Add Helm Repositories
bash# Add required repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update
2. Install Dependencies First
bash# Install cert-manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
3. Create Namespace
bashkubectl create namespace harbortech
kubectl create namespace harbortech
4. Configure Values
Create a custom values file for your environment:
bash# Copy and edit values
cp values.yaml my-values.yaml

# Edit with your settings
nano my-values.yaml
Required Changes in my-values.yaml:
yamlglobal:
  domain: your-portal.example.com  # Change this

keycloak:
  auth:
    adminPassword: <strong-password>  # Change this

postgresql:
  auth:
    password: <strong-password>  # Change this
5. Install Cloud Portal
bash# Install with Helm
helm install cloudform ./helm \
  --namespace harbortech \
  --values values.yaml \
  --wait \
  --timeout 10m

# Verify installation
kubectl get pods -n harbortech
6. Configure Keycloak
bash# Port-forward to Keycloak
kubectl port-forward -n harbortech svc/cloudform-keycloak 8080:8080

# Access Keycloak admin console
# URL: http://localhost:8080
# Username: admin
# Password: (from values.yaml)
Keycloak Configuration:

Create a new realm called cloudform
Create a client called cloudform-api:

Client Protocol: openid-connect
Access Type: confidential
Valid Redirect URIs: https://your-portal.example.com/*
Save and get the client secret from Credentials tab


Create a client called portal-frontend:

Client Protocol: openid-connect
Access Type: public
Valid Redirect URIs: https://your-portal.example.com/*


Create roles: admin, operator, viewer
Create users and assign roles

7. Configure Vault
bash# Port-forward to Vault
kubectl port-forward -n harbortech svc/cloudform-vault 8200:8200

# Initialize Vault
export VAULT_ADDR='http://localhost:8200'
vault operator init

# Save the unseal keys and root token!

# Unseal Vault (use 3 of 5 keys)
vault operator unseal <key-1>
vault operator unseal <key-2>
vault operator unseal <key-3>

# Login with root token
vault login <root-token>

# Enable KV secrets engine
vault secrets enable -path=cloudform kv-v2

# Create policy for Portal API
vault policy write cloudform-api - <<EOF
path "cloudform/data/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
EOF

# Create token for Portal API
vault token create -policy=cloudform-api
8. Update Secrets with Real Values
bash# Update Portal API secrets
kubectl create secret generic cloudform-secrets \
  --from-literal=database-url="postgresql://cloudportal:<password>@cloudform-postgresql:5432/cloudportal" \
  --from-literal=keycloak-client-secret="<client-secret-from-keycloak>" \
  --from-literal=vault-token="<vault-token>" \
  --namespace harbortech \
  --dry-run=client -o yaml | kubectl apply -f -
9. Verify Deployment
bash# Check all pods are running
kubectl get pods -n harbortech
kubectl get pods -n harbortech

# Check ingress
kubectl get ingress -n harbortech

# Check services
kubectl get svc -n harbortech

# View logs
kubectl logs -n harbortech deployment/cloudform-api
kubectl logs -n harbortech deployment/cloudform-terminal
10. Access the Portal
bash# Get the external IP
kubectl get ingress -n harbortech

# Access the portal
# https://your-portal.example.com
Building Container Images
Portal API (Node.js Example)
dockerfile# Dockerfile.api
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

CMD ["node", "src/index.js"]
Build and Push:
bash# Build
docker build -f Dockerfile.api -t your-registry/cloudform-api:1.0.0 .

# Push
docker push your-registry/cloudform-api:1.0.0
Terminal Service (Node.js Example)
dockerfile# Dockerfile.terminal
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8081

CMD ["node", "src/terminal.js"]
Frontend (React with NGINX)
dockerfile# Dockerfile.frontend
# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

USER appuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
NGINX Configuration:
nginx# nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://cloudform-api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://cloudform-terminal:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
Upgrade Process
bash# Pull latest chart changes
git pull

# Update dependencies
helm dependency update ./cloudform

# Upgrade installation
helm upgrade cloudform ./cloudform \
  --namespace harbortech \
  --values my-values.yaml \
  --wait

# Verify upgrade
kubectl rollout status deployment/cloudform-api -n harbortech
kubectl rollout status deployment/cloudform-terminal -n harbortech
Rollback
bash# List releases
helm history cloudform -n harbortech

# Rollback to previous version
helm rollback cloudform -n harbortech

# Rollback to specific version
helm rollback cloudform 2 -n harbortech
Backup & Restore
Backup Database
bash# Backup PostgreSQL
kubectl exec -n harbortech cloudform-postgresql-0 -- \
  pg_dump -U cloudportal cloudportal | gzip > backup-$(date +%Y%m%d).sql.gz

# Backup Vault data
kubectl cp cloudform/cloudform-vault-0:/vault/data ./vault-backup-$(date +%Y%m%d)
Restore Database
bash# Restore PostgreSQL
gunzip < backup-20251110.sql.gz | \
  kubectl exec -i -n harbortech cloudform-postgresql-0 -- \
  psql -U cloudportal cloudportal

# Restore Vault
kubectl cp ./vault-backup-20251110 cloudform/cloudform-vault-0:/vault/data
kubectl rollout restart statefulset/cloudform-vault -n harbortech
Troubleshooting
Check Logs
bash# API logs
kubectl logs -f -n harbortech deployment/cloudform-api

# Terminal service logs
kubectl logs -f -n harbortech deployment/cloudform-terminal

# Frontend logs
kubectl logs -f -n harbortech deployment/cloudform-frontend

# Container logs
kubectl logs -f -n harbortech <pod-name>
Common Issues
Pods not starting:
bash# Check events
kubectl describe pod <pod-name> -n harbortech

# Check resource quotas
kubectl describe resourcequota -n harbortech
Database connection issues:
bash# Test connection from API pod
kubectl exec -it -n harbortech deployment/cloudform-api -- \
  /bin/sh -c 'apk add postgresql-client && psql $DATABASE_URL'
WebSocket connection failing:
bash# Check ingress annotations
kubectl describe ingress cloudform -n harbortech

# Verify terminal service is running
kubectl get pods -n harbortech -l app.kubernetes.io/component=terminal
Container creation failing:
bash# Check RBAC permissions
kubectl auth can-i create pods --namespace harbortech --as system:serviceaccount:cloudform:cloudform-api-sa

# Check resource quotas
kubectl describe resourcequota -n harbortech
Monitoring
View Metrics
bash# API metrics
kubectl port-forward -n harbortech svc/cloudform-api 8080:8080
curl http://localhost:8080/metrics

# Terminal metrics
kubectl port-forward -n harbortech svc/cloudform-terminal 8081:8081
curl http://localhost:8081/metrics
Prometheus Queries
promql# Active containers
cloudportal_active_containers

# API request rate
rate(cloudportal_api_requests_total[5m])

# API latency p95
histogram_quantile(0.95, rate(cloudportal_api_request_duration_seconds_bucket[5m]))

# WebSocket connections
cloudportal_websocket_connections
Scaling
Manual Scaling
bash# Scale API
kubectl scale deployment cloudform-api -n harbortech --replicas=5

# Scale Terminal Service
kubectl scale deployment cloudform-terminal -n harbortech --replicas=5
Configure HPA
Already configured in values.yaml. Verify:
bashkubectl get hpa -n harbortech
Security Considerations
SSL/TLS

Use cert-manager with Let's Encrypt for production
Enforce HTTPS redirects in ingress

Secrets Management

Never commit secrets to git
Use Vault for credential storage
Rotate credentials regularly

Network Policies

Enabled by default
Isolates container workloads
Restricts egress to cloud APIs only

Pod Security

Non-root containers
Read-only root filesystem where possible
Drop all capabilities
Security context enforced

RBAC

Minimal permissions per component
Service accounts per namespace
No cluster-admin access

Performance Tuning
Database Connection Pooling
yaml# values.yaml
portalApi:
  env:
    databasePoolSize: 20
    databasePoolTimeout: 30000
Container Resource Limits
yaml# values.yaml
containers:
  defaultResources:
    requests:
      memory: "512Mi"  # Increase for heavy workloads
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
HPA Configuration
yaml# values.yaml
portalApi:
  autoscaling:
    minReplicas: 3
    maxReplicas: 20
    targetCPUUtilizationPercentage: 60  # Scale earlier
Uninstall
bash# Uninstall Helm release
helm uninstall cloudform -n harbortech

# Delete namespaces
kubectl delete namespace harbortech
kubectl delete namespace harbortech

# Clean up CRDs if needed
kubectl delete crd <cert-manager-crds>
Development Setup
Local Development with Minikube
bash# Start minikube
minikube start --cpus=4 --memory=8192

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# Install with dev values
helm install cloudform ./cloudform \
  --namespace harbortech \
  --create-namespace \
  --values values-dev.yaml

# Get minikube IP
minikube ip

# Add to /etc/hosts
echo "$(minikube ip) portal-dev.example.com" | sudo tee -a /etc/hosts
Hot Reload Development
bash# Use Skaffold for development
skaffold dev

# Or use Tilt
tilt up
CI/CD Integration
GitHub Actions Example
yamlname: Deploy Cloud Portal

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure kubectl
      uses: azure/k8s-set-context@v3
      with:
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
    
    - name: Install Helm
      uses: azure/setup-helm@v3
    
    - name: Deploy
      run: |
        helm upgrade --install cloudform ./cloudform \
          --namespace harbortech \
          --values values-prod.yaml \
          --set portalApi.image.tag=${{ github.sha }} \
          --wait
Support
For issues and questions:

GitHub Issues: https://github.com/your-org/cloudform/issues
Documentation: https://docs.example.com/cloudform
Email: support@example.com