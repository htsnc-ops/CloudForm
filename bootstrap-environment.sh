brew install kubectl

brew install minikube

minikube start

kubectl create namespace argocd

# Install ArgoCD using the official manifest
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Watch the pods come up
kubectl get pods -n argocd -w

# Forward ArgoCD server port to localhost
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Show password for ArgoCD initial admin account
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d

# Install dependencies for Linux
# test -d ~/.linuxbrew && eval "$(~/.linuxbrew/bin/brew shellenv)"
# test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
# echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.bashrc

# Install dependencies macos
# /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

kubectl create clusterrolebinding argocd-admin --clusterrole=cluster-admin --serviceaccount=argocd:argocd-application-controller

brew install npm

echo " to ensure npm builds are successful, "
echo " navigate to any dir with a package.json "
echo " and run `npm install`, then follow the "
echo " directions to fix vulnerabilities "

# In case of emergency and you need to bail on your namespace
remove_namespace() {
    local NAMESPACE="$1"
    if [ -z "$NAMESPACE" ]; then
        echo "Usage: remove_namespace_finalizers <namespace>" >&2
        return 1
    fi

    # start proxy in background and silence output
    kubectl proxy >/dev/null 2>&1 &
    local PROXY_PID=$!
    # ensure proxy is killed when function exits
    trap 'kill "$PROXY_PID" 2>/dev/null || true' RETURN

    # use a safe temp file
    local TMPFILE
    TMPFILE=$(mktemp) || { echo "mktemp failed" >&2; return 1; }

    # clear finalizers (do not overwrite .spec entirely)
    kubectl get namespace "$NAMESPACE" -o json | jq '.spec.finalizers = []' >| "$TMPFILE"

    # push the modified namespace to the API
    curl -s -k -H "Content-Type: application/json" -X PUT --data-binary @"$TMPFILE" http://127.0.0.1:8001/api/v1/namespaces/"$NAMESPACE"/finalize

    rm -f "$TMPFILE"
    # proxy killed by trap
}
