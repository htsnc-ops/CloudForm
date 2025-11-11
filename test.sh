#!/bin/bash

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