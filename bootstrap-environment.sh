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