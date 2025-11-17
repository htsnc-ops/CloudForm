#!/bin/bash

# Linting script for the CloudForm project

# Exit immediately if a command exits with a non-zero status
set -e

# Define the directories to lint
API_DIR="./api/src"
FRONTEND_DIR="./frontend/src"
TERMINAL_DIR="./terminal/src"
SHARED_DIR="./src/common"

# Run ESLint for API, Frontend, Terminal, and Shared libraries
echo "Running ESLint for API..."
npx eslint $API_DIR --ext .ts,.tsx

echo "Running ESLint for Frontend..."
npx eslint $FRONTEND_DIR --ext .ts,.tsx

echo "Running ESLint for Terminal..."
npx eslint $TERMINAL_DIR --ext .ts,.tsx

echo "Running ESLint for Shared libraries..."
npx eslint $SHARED_DIR --ext .ts

echo "Linting completed successfully!"