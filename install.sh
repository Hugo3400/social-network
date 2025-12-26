#!/bin/bash

# Social Hybrid Network - Quick Installer Script
# This script helps you set up the application quickly

set -e

echo "🚀 Social Hybrid Network - Quick Installer"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Ask for database password
echo "Please enter a secure database password:"
read -s DB_PASSWORD
echo ""

# Create .env file
echo "Creating .env file..."
echo "DB_PASSWORD=$DB_PASSWORD" > .env
echo "✅ Environment file created"
echo ""

# Start services
echo "Starting services with Docker Compose..."
docker-compose up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Wait about 30 seconds for services to initialize"
echo "2. Open your browser and go to: http://localhost"
echo "3. You'll be redirected to the setup wizard"
echo "4. Follow the wizard steps to complete installation"
echo ""
echo "🔍 Check status: docker-compose ps"
echo "📋 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""
echo "Happy networking! 🎉"
