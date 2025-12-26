#!/bin/bash

# Health check script for Social Hybrid Network

echo "🏥 Health Check - Social Hybrid Network"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    exit 1
fi
echo "✅ Docker is running"

# Check containers
echo ""
echo "📦 Container Status:"
docker-compose ps

# Check database
echo ""
echo "🗄️  Database Connection:"
if docker exec social-hybrid-db pg_isready -U postgres &> /dev/null; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not responding"
fi

# Check backend
echo ""
echo "⚙️  Backend API:"
if curl -s http://localhost:3001/api/health &> /dev/null; then
    echo "✅ Backend is responding"
    curl -s http://localhost:3001/api/health | json_pp 2>/dev/null || echo "(Health endpoint OK)"
else
    echo "❌ Backend is not responding"
fi

# Check frontend
echo ""
echo "🌐 Frontend:"
if curl -s http://localhost &> /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi

# Check disk usage
echo ""
echo "💾 Disk Usage:"
docker system df

echo ""
echo "🔍 Logs (last 10 lines):"
docker-compose logs --tail=10

echo ""
echo "✅ Health check complete!"
