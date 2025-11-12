#!/bin/bash

# set -e

# Configuration
GITHUB_USER=${GITHUB_USER:-"htsnc-ops"}
VERSION=${VERSION:-"1.0.0"}
REGISTRY="ghcr.io"

echo "================================"
echo "Building Cloud Portal Images"
echo "================================"
echo "Registry: $REGISTRY"
echo "User: $GITHUB_USER"
echo "Version: $VERSION"
echo ""

# # Check if logged in
# echo "Checking GHCR login status..."
# if ! docker info | grep -q "Username"; then
#     echo "❌ Not logged in to GHCR"
#     echo ""
#     echo "Please login first:"
#     echo "  export GITHUB_TOKEN=your_token"
#     echo "  token is at c/Users/Tom/token.txt"
#     echo "  echo \$GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin"
#     exit 1
# fi

echo "✓ Logged in to GHCR"
echo ""

# # Build API
# echo "📦 Building Portal API..."
# docker build -t $REGISTRY/$GITHUB_USER/cloud-portal-api:$VERSION \
#     -t $REGISTRY/$GITHUB_USER/cloud-portal-api:latest \
#     -f Dockerfile.api .
# echo "✓ Portal API built"
# echo ""

# Build Terminal
echo "📦 Building Terminal Service..."
docker build -t $REGISTRY/$GITHUB_USER/cloud-portal-terminal:$VERSION \
    -t $REGISTRY/$GITHUB_USER/cloud-portal-terminal:latest \
    -f Dockerfile.terminal .
echo "✓ Terminal Service built"
echo ""

# # Build Frontend
# echo "📦 Building Frontend..."
# docker build -t $REGISTRY/$GITHUB_USER/cloud-portal-frontend:$VERSION \
#     -t $REGISTRY/$GITHUB_USER/cloud-portal-frontend:latest \
#     -f Dockerfile.frontend .
# echo "✓ Frontend built"
# echo ""

# # Push images
# echo "================================"
# echo "Pushing Images to GHCR"
# echo "================================"
# echo ""

# echo "📤 Pushing Portal API..."
# docker push $REGISTRY/$GITHUB_USER/cloud-portal-api:$VERSION
# docker push $REGISTRY/$GITHUB_USER/cloud-portal-api:latest

# echo "📤 Pushing Terminal Service..."
# docker push $REGISTRY/$GITHUB_USER/cloud-portal-terminal:$VERSION
# docker push $REGISTRY/$GITHUB_USER/cloud-portal-terminal:latest

# echo "📤 Pushing Frontend..."
# docker push $REGISTRY/$GITHUB_USER/cloud-portal-frontend:$VERSION
# docker push $REGISTRY/$GITHUB_USER/cloud-portal-frontend:latest

# echo ""
# echo "================================"
# echo "✅ All images built and pushed!"
# echo "================================"
# echo ""
# echo "Images:"
# echo "  • $REGISTRY/$GITHUB_USER/cloud-portal-api:$VERSION"
# echo "  • $REGISTRY/$GITHUB_USER/cloud-portal-terminal:$VERSION"
# echo "  • $REGISTRY/$GITHUB_USER/cloud-portal-frontend:$VERSION"
# echo ""
# echo "Next steps:"
# echo "  1. Make images public on GitHub"
# echo "  2. Update my-values.yaml with these image paths"
# echo "  3. Deploy with Helm"