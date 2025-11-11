#!/bin/bash

################################################################################
# Cloud Portal Infrastructure Validation Script
# This script checks if all required infrastructure components are present
################################################################################

# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "PASS")
            echo -e "${GREEN}✓${NC} ${message}"
            ((PASSED++))
            ;;
        "FAIL")
            echo -e "${RED}✗${NC} ${message}"
            ((FAILED++))
            ;;
        "WARN")
            echo -e "${YELLOW}⚠${NC} ${message}"
            ((WARNINGS++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ${NC} ${message}"
            ;;
    esac
}

print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

################################################################################
# 1. Check Kubernetes Cluster Access
################################################################################

print_section "1. Kubernetes Cluster Access"

if command -v kubectl &> /dev/null; then
    print_status "PASS" "kubectl is installed"
    KUBECTL_VERSION=$(kubectl version -o json 2>/dev/null | grep -o '"gitVersion": *"[^"]*"' | head -1 | cut -d'"' -f4)
    print_status "INFO" "kubectl version:" 
    echo $KUBECTL_VERSION
else
    print_status "FAIL" "kubectl is not installed"
    echo "  Install: https://kubernetes.io/docs/tasks/tools/"
fi

if kubectl cluster-info &> /dev/null; then
#     print_status "PASS" "Can connect to Kubernetes cluster"
    
    # Get cluster info
    CLUSTER_VERSION=$(kubectl version -o json 2>/dev/null | grep -A7 '"serverVersion"' | grep -o '"gitVersion": *"[^"]*"' | cut -d'"' -f4)
    print_status "INFO" "Cluster version: $CLUSTER_VERSION"
    
    # Check version compatibility (needs 1.24+)
    MIN_VERSION="1.24"
    CURRENT_VERSION=$(echo $CLUSTER_VERSION | grep -oP 'v\K[0-9]+\.[0-9]+')
    if [[ $(echo -e "$MIN_VERSION\n$CURRENT_VERSION" | sort -V | head -n1) == "$MIN_VERSION" ]]; then
        print_status "PASS" "Cluster version is $CURRENT_VERSION (>= $MIN_VERSION required)"
    else
        print_status "FAIL" "Cluster version $CURRENT_VERSION is below minimum $MIN_VERSION"
    fi
else
    print_status "FAIL" "Cannot connect to Kubernetes cluster"
    echo "  Check your kubeconfig: kubectl cluster-info"
    exit 1
fi

################################################################################
# 2. Check Worker Nodes
################################################################################

print_section "2. Worker Nodes"

NODE_COUNT=$(kubectl get nodes --no-headers 2>/dev/null | wc -l)
READY_NODES=$(kubectl get nodes --no-headers 2>/dev/null | grep -c " Ready" || echo 0)

print_status "INFO" "Total nodes: $NODE_COUNT"
print_status "INFO" "Ready nodes: $READY_NODES"

if [ "$READY_NODES" -ge 3 ]; then
    print_status "PASS" "At least 3 worker nodes are ready"
else
    print_status "WARN" "Only $READY_NODES ready nodes (3+ recommended for HA)"
fi

# Show node details
echo ""
echo "Node Details:"
kubectl get nodes -o custom-columns=NAME:.metadata.name,STATUS:.status.conditions[-1].type,ROLES:.metadata.labels."kubernetes\.io/role",VERSION:.status.nodeInfo.kubeletVersion,CPU:.status.capacity.cpu,MEMORY:.status.capacity.memory 2>/dev/null || true

# Check node resources
echo ""
print_status "INFO" "Checking node resources..."
TOTAL_CPU_CAPACITY=$(kubectl get nodes -o json | jq -r '.items[].status.capacity.cpu')
TOTAL_ALLOCATABLE_CPU=$(kubectl get nodes -o json | jq -r '.items[].status.allocatable.cpu')
TOTAL_ALLOCATABLE_MEMORY=$(kubectl get nodes -o json | jq -r '.items[].status.allocatable.memory' | awk '{s+=$1} END {printf "%.0f\n", s/1024/1024}')
TOTAL_MEMORY_CAPACITY=$(kubectl get nodes -o json | jq -r '.items[].status.capacity.memory' | awk '{s+=$1} END {printf "%.0f\n", s/1024/1024}')

print_status "INFO" "Total cluster CPU Capacity: ${TOTAL_CPU_CAPACITY} cores"
print_status "INFO" "Total cluster Allocatable CPU: ${TOTAL_ALLOCATABLE_CPU} cores"
print_status "INFO" "Total cluster Memory: ${TOTAL_MEMORY_CAPACITY} GB"
print_status "INFO" "Total cluster Allocatable Memory: ${TOTAL_ALLOCATABLE_MEMORY} GB"

if [ "$TOTAL_ALLOCATABLE_CPU" -ge 8 ]; then
    print_status "PASS" "Sufficient CPU resources (8+ cores recommended)"
else
    print_status "WARN" "Low CPU resources: ${TOTAL_ALLOCATABLE_CPU} cores (8+ recommended)"
fi

if [ "$TOTAL_ALLOCATABLE_MEMORY" -ge 16 ]; then
    print_status "PASS" "Sufficient memory resources (16+ GB recommended)"
else
    print_status "WARN" "Low memory resources: ${TOTAL_ALLOCATABLE_MEMORY} GB (16+ GB recommended)"
fi

################################################################################
# 3. Check Storage
################################################################################

print_section "3. Storage Classes"

if kubectl get storageclass &> /dev/null; then
    print_status "PASS" "StorageClasses are available"
    
    STORAGE_CLASSES=$(kubectl get storageclass --no-headers 2>/dev/null | wc -l)
    print_status "INFO" "Available storage classes: $STORAGE_CLASSES"
    
    echo ""
    echo "StorageClass Details:"
    kubectl get storageclass -o custom-columns=NAME:.metadata.name,PROVISIONER:.provisioner,DEFAULT:.metadata.annotations."storageclass\.kubernetes\.io/is-default-class" 2>/dev/null || true
    
    DEFAULT_SC=$(kubectl get storageclass -o json 2>/dev/null | grep -B5 '"storageclass.kubernetes.io/is-default-class": "true"' | grep '"name"' | cut -d'"' -f4 | head -n1)
    
    if [ -n "$DEFAULT_SC" ]; then
        print_status "PASS" "Default storage class: $DEFAULT_SC"
    else
        print_status "WARN" "No default storage class set"
        echo "  Set default: kubectl patch storageclass <name> -p '{\"metadata\": {\"annotations\":{\"storageclass.kubernetes.io/is-default-class\":\"true\"}}}'"
    fi
    
    # Check available storage
    echo ""
    print_status "INFO" "Checking PersistentVolumes..."
    PV_COUNT=$(kubectl get pv --no-headers 2>/dev/null | wc -l)
    print_status "INFO" "Existing PersistentVolumes: $PV_COUNT"
    
else
    print_status "FAIL" "No storage classes found"
    echo "  Your cluster needs a storage provisioner"
fi

################################################################################
# 4. Check NGINX Ingress Controller
################################################################################

print_section "4. NGINX Ingress Controller"

if kubectl get namespace ingress-nginx &> /dev/null; then
    print_status "PASS" "ingress-nginx namespace exists"
    
    INGRESS_PODS=$(kubectl get pods -n ingress-nginx -l app.kubernetes.io/component=controller --no-headers 2>/dev/null | grep -c "Running" || echo 0)
    
    if [ "$INGRESS_PODS" -gt 0 ]; then
        print_status "PASS" "NGINX Ingress Controller is running ($INGRESS_PODS pod(s))"
        
        # Check ingress class
        if kubectl get ingressclass nginx &> /dev/null; then
            print_status "PASS" "IngressClass 'nginx' exists"
        else
            print_status "WARN" "IngressClass 'nginx' not found"
        fi
        
        # Show service details
        echo ""
        echo "Ingress Service:"
        kubectl get svc -n ingress-nginx ingress-nginx-controller 2>/dev/null || true
        
    else
        print_status "FAIL" "NGINX Ingress Controller pods are not running"
    fi
else
    print_status "FAIL" "NGINX Ingress Controller is not installed"
    echo ""
    echo "  Install NGINX Ingress Controller:"
    echo "  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml"
    echo ""
    echo "  Or using Helm:"
    echo "  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx"
    echo "  helm repo update"
    echo "  helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace"
fi

################################################################################
# 5. Check Cert-Manager
################################################################################

print_section "5. Cert-Manager (SSL Certificates)"

if kubectl get namespace cert-manager &> /dev/null; then
    print_status "PASS" "cert-manager namespace exists"
    
    CERTMANAGER_PODS=$(kubectl get pods -n cert-manager --no-headers 2>/dev/null | grep -c "Running" || echo 0)
    
    if [ "$CERTMANAGER_PODS" -ge 3 ]; then
        print_status "PASS" "Cert-manager is running ($CERTMANAGER_PODS pods)"
        
        # Check CRDs
        if kubectl get crd certificates.cert-manager.io &> /dev/null; then
            print_status "PASS" "Cert-manager CRDs are installed"
        else
            print_status "WARN" "Cert-manager CRDs not found"
        fi
        
        # Check for ClusterIssuers
        ISSUERS=$(kubectl get clusterissuer --no-headers 2>/dev/null | wc -l)
        if [ "$ISSUERS" -gt 0 ]; then
            print_status "PASS" "Found $ISSUERS ClusterIssuer(s)"
            echo ""
            echo "ClusterIssuers:"
            kubectl get clusterissuer 2>/dev/null || true
        else
            print_status "WARN" "No ClusterIssuers found (needed for SSL certificates)"
            echo ""
            echo "  Create a ClusterIssuer for Let's Encrypt:"
            echo "  See deployment guide for example"
        fi
        
    else
        print_status "FAIL" "Cert-manager pods are not running"
    fi
else
    print_status "FAIL" "Cert-manager is not installed"
    echo ""
    echo "  Install Cert-Manager:"
    echo "  kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml"
    echo ""
    echo "  Or using Helm:"
    echo "  helm repo add jetstack https://charts.jetstack.io"
    echo "  helm repo update"
    echo "  helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set installCRDs=true"
fi

################################################################################
# 6. Check Metrics Server
################################################################################

print_section "6. Metrics Server (HPA Support)"

if kubectl get deployment metrics-server -n kube-system &> /dev/null 2>&1; then
    print_status "PASS" "Metrics server deployment exists"
    
    METRICS_PODS=$(kubectl get pods -n kube-system -l k8s-app=metrics-server --no-headers 2>/dev/null | grep -c "Running" || echo 0)
    
    if [ "$METRICS_PODS" -gt 0 ]; then
        print_status "PASS" "Metrics server is running"
        
        # Test if metrics are available
        if kubectl top nodes &> /dev/null; then
            print_status "PASS" "Metrics API is working"
            echo ""
            echo "Node Metrics:"
            kubectl top nodes 2>/dev/null || true
        else
            print_status "WARN" "Metrics API is not responding yet (may need a few minutes)"
        fi
    else
        print_status "FAIL" "Metrics server pods are not running"
    fi
else
    print_status "FAIL" "Metrics server is not installed"
    echo ""
    echo "  Install Metrics Server:"
    echo "  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"
    echo ""
    echo "  Or using Helm:"
    echo "  helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/"
    echo "  helm install metrics-server metrics-server/metrics-server --namespace kube-system"
    echo ""
    echo "  For local development (minikube/kind), you may need to add --kubelet-insecure-tls"
fi

################################################################################
# 7. Check Helm
################################################################################

print_section "7. Helm Package Manager"

if command -v helm &> /dev/null; then
    print_status "PASS" "Helm is installed"
    HELM_VERSION=$(helm version --short 2>/dev/null)
    print_status "INFO" "Helm version: $HELM_VERSION"
    
    # Check if Helm 3+
    if [[ $HELM_VERSION == v3* ]]; then
        print_status "PASS" "Helm 3.x detected"
    else
        print_status "WARN" "Helm 3.x recommended (found $HELM_VERSION)"
    fi
else
    print_status "FAIL" "Helm is not installed"
    echo "  Install: https://helm.sh/docs/intro/install/"
fi

################################################################################
# 8. Check Required Namespaces
################################################################################

print_section "8. Required Namespaces"

check_or_create_namespace() {
    local ns=$1
    if kubectl get namespace "$ns" &> /dev/null; then
        print_status "PASS" "Namespace '$ns' exists"
    else
        print_status "WARN" "Namespace '$ns' does not exist (will be created during installation)"
    fi
}

check_or_create_namespace "cloudform"
check_or_create_namespace "cloudform-containers"

################################################################################
# 9. Check Network Policies Support
################################################################################

print_section "9. Network Policies Support"

# Try to create a test network policy
if kubectl create -f - <<EOF 2>/dev/null
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: test-netpol
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
EOF
then
    print_status "PASS" "Network Policies are supported"
    kubectl delete networkpolicy test-netpol -n default &> /dev/null
else
    print_status "WARN" "Network Policies may not be supported by your CNI"
    echo "  Supported CNIs: Calico, Cilium, Weave Net"
fi

################################################################################
# 10. Additional Recommendations
################################################################################

print_section "10. Additional Checks"

# Check if LoadBalancer service type is available
LB_SERVICES=$(kubectl get svc --all-namespaces -o json 2>/dev/null | grep -c '"type": "LoadBalancer"' || echo 0)
if [ "$LB_SERVICES" -gt 0 ]; then
    print_status "PASS" "LoadBalancer service type is available"
else
    print_status "INFO" "No LoadBalancer services found (may need MetalLB for bare-metal)"
fi

# Check RBAC
if kubectl auth can-i create deployment --all-namespaces &> /dev/null; then
    print_status "PASS" "Current user has cluster-admin permissions"
else
    print_status "WARN" "Current user may not have sufficient permissions"
fi

# Check DNS
if kubectl run -it --rm dns-test --image=busybox --restart=Never -- nslookup kubernetes.default &> /dev/null; then
    print_status "PASS" "DNS resolution is working"
else
    print_status "INFO" "DNS check skipped (requires interactive terminal)"
fi

################################################################################
# 11. Ensure Proper Helm Repositories
################################################################################

print_section "11. Ensure Helm Repositories"

# Define required repos
REPOS='[{"name":"hashicorp","url":"https://helm.releases.hashicorp.com"},{"name":"bitnami","url":"https://charts.bitnami.com/bitnami"},{"name":"prometheus-community","url":"https://prometheus-community.github.io/helm-charts"}]'

# Loop through each repo
echo "$REPOS" | jq -c '.[]' | while read -r repo; do
    name=$(echo "$repo" | jq -r '.name')
    url=$(echo "$repo" | jq -r '.url')
    
    # Check if repo is already added
    if helm repo list | awk '{print $1}' | grep -qx "$name"; then
        print_status "INFO" "Helm repo '$name' already exists"
    else
        print_status "INFO" "Adding Helm repo '$name'"
        if helm repo add "$name" "$url"; then
            print_status "PASS" "Added Helm repo '$name'"
        else
            print_status "FAIL" "Failed to add Helm repo '$name'"
        fi
    fi
done

# Update repos
print_status "INFO" "Updating Helm repositories..."
helm repo update

# -------------------------------
# Ensure Prometheus Operator CRDs
# -------------------------------
# Check if PrometheusRule CRD exists
if kubectl get crd prometheusrules.monitoring.coreos.com &>/dev/null; then
    print_status "INFO" "Prometheus Operator CRDs already installed"
else
    print_status "INFO" "Installing Prometheus Operator CRDs via Helm"
    
    # Create a namespace for Prometheus Operator if it doesn't exist
    if ! kubectl get ns monitoring &>/dev/null; then
        kubectl create ns monitoring
    fi

    # Install kube-prometheus-stack (Prometheus Operator) in the monitoring namespace
    if helm upgrade --install prometheus-operator prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --create-namespace \
        --set prometheusOperator.createCustomResource=true \
        --wait; then
        print_status "PASS" "Prometheus Operator installed successfully"
    else
        print_status "FAIL" "Failed to install Prometheus Operator"
    fi
fi

################################################################################
# Summary
################################################################################

print_section "Summary"

echo ""
echo "Results:"
echo -e "  ${GREEN}Passed:${NC}   $PASSED"
echo -e "  ${RED}Failed:${NC}   $FAILED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Your cluster meets all requirements!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review any warnings above"
    echo "  2. Proceed with Cloud Portal installation"
    echo "  3. Run: helm install cloudform helm --namespace cloudform --create-namespace"
    exit 0
elif [ $FAILED -le 2 ]; then
    echo -e "${YELLOW}⚠ Your cluster is mostly ready but has some issues${NC}"
    echo ""
    echo "Action required:"
    echo "  Fix the failed checks above before installing"
    exit 1
else
    echo -e "${RED}✗ Your cluster needs significant setup${NC}"
    echo ""
    echo "Action required:"
    echo "  Install missing components listed above"
    exit 1
fi