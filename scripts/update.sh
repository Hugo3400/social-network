#!/bin/bash

# Update script for Social Hybrid Network

echo "🔄 Updating Social Hybrid Network..."
echo ""

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# Update backend dependencies
echo "📦 Updating backend dependencies..."
cd backend
npm install
cd ..

# Update frontend dependencies
echo "📦 Updating frontend dependencies..."
cd frontend
npm install
cd ..

# Rebuild Docker images
echo "🐳 Rebuilding Docker images..."
docker-compose build

# Restart services
echo "🔄 Restarting services..."
docker-compose down
docker-compose up -d

echo ""
echo "✅ Update completed!"
echo "🔍 Check status: docker-compose ps"
echo "📋 View logs: docker-compose logs -f"
