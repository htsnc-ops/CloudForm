#!/bin/bash

# set -e

# Configuration
GITHUB_USER=${GITHUB_USER:-"htsnc-ops"}
VERSION=${VERSION:-"$1"}
REGISTRY="ghcr.io"
PLATFORM="linux/amd64"     # linux/arm64 - mac-based build; linux/amd64 - windows-based build

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
echo GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USER --password-stdin
echo "✓ Logged in to GHCR"
echo ""

# Build API
echo "📦 Building Portal API..."
docker buildx build --platform $PLATFORM \
    -t $REGISTRY/$GITHUB_USER/cloudform-api:$VERSION \
    -t $REGISTRY/$GITHUB_USER/cloudform-api:latest \
    -f Dockerfile.api --push .
echo "✓ Portal API built and pushed"
echo ""

# Build Terminal
echo "📦 Building Terminal Service..."
docker buildx build --platform $PLATFORM \
    -t $REGISTRY/$GITHUB_USER/cloudform-terminal:$VERSION \
    -t $REGISTRY/$GITHUB_USER/cloudform-terminal:latest \
    -f Dockerfile.terminal --push .
echo "✓ Terminal Service built and pushed"
echo ""

# Build Frontend
echo "📦 Building Frontend..."
docker buildx build --platform $PLATFORM \
    -t $REGISTRY/$GITHUB_USER/cloudform-frontend:$VERSION \
    -t $REGISTRY/$GITHUB_USER/cloudform-frontend:latest \
    -f Dockerfile.frontend --push .
echo "✓ Frontend built and pushed"
echo ""

# # Push images
# echo "================================"
# echo "Pushing Images to GHCR"
# echo "================================"
# echo ""

# echo "📤 Pushing Portal API..."
# docker push $REGISTRY/$GITHUB_USER/cloudform-api:$VERSION
# docker push $REGISTRY/$GITHUB_USER/cloudform-api:latest

# echo "📤 Pushing Terminal Service..."
# docker push $REGISTRY/$GITHUB_USER/cloudform-terminal:$VERSION
# docker push $REGISTRY/$GITHUB_USER/cloudform-terminal:latest

# echo "📤 Pushing Frontend..."
# docker push $REGISTRY/$GITHUB_USER/cloudform-frontend:$VERSION
# docker push $REGISTRY/$GITHUB_USER/cloudform-frontend:latest

echo ""
echo "================================"
echo "✅ All images built and pushed!"
echo "================================"
echo ""
echo "Images:"
echo "  • $REGISTRY/$GITHUB_USER/cloudform-api:$VERSION"
echo "  • $REGISTRY/$GITHUB_USER/cloudform-terminal:$VERSION"
echo "  • $REGISTRY/$GITHUB_USER/cloudform-frontend:$VERSION"
echo ""
echo "Next steps:"
echo "  1. Make images public on GitHub"
echo "  2. Update my-values.yaml with these image paths"
echo "  3. Deploy with Helm"