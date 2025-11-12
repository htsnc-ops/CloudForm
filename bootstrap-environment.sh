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

# Install dependencies for Linux
test -d ~/.linuxbrew && eval "$(~/.linuxbrew/bin/brew shellenv)"
test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.bashrc

brew install npm

echo " to ensure npm builds are successful, "
echo " navigate to any dir with a package.json "
echo " and run `npm install`, then follow the "
echo " directions to fix vulnerabilities "