#!/bin/bash

# Start all services for the multi-tenant cloud management portal

# Start the API service
echo "Starting API service..."
docker-compose -f docker-compose.yml up -d api

# Start the frontend service
echo "Starting Frontend service..."
docker-compose -f docker-compose.yml up -d frontend

# Start the terminal service
echo "Starting Terminal service..."
docker-compose -f docker-compose.yml up -d terminal

# Wait for services to be up
echo "Waiting for services to initialize..."
sleep 10

# Check if services are running
echo "Checking service status..."
docker-compose -f docker-compose.yml ps

echo "All services started successfully!"