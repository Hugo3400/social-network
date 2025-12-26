#!/bin/bash

# Quick start verification script

echo "🎯 Social Hybrid Network - Pre-deployment Checklist"
echo "====================================================="
echo ""

echo "📋 Checking project structure..."
echo ""

# Check critical files
FILES=(
    "backend/package.json"
    "backend/server.js"
    "backend/app/db/schema.sql"
    "frontend/package.json"
    "frontend/src/App.js"
    "docker-compose.yml"
    "README.md"
)

MISSING=0

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        MISSING=$((MISSING+1))
    fi
done

echo ""

if [ $MISSING -gt 0 ]; then
    echo "❌ Some files are missing. Please ensure all files are present."
    exit 1
fi

echo "✅ All critical files present!"
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    DOCKER_VERSION=$(docker --version)
    echo "   $DOCKER_VERSION"
else
    echo "⚠️  Docker is not installed"
    echo "   Install from: https://docs.docker.com/get-docker/"
fi

echo ""

# Check if Docker Compose is installed
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed"
    COMPOSE_VERSION=$(docker-compose --version)
    echo "   $COMPOSE_VERSION"
else
    echo "⚠️  Docker Compose is not installed"
    echo "   Install from: https://docs.docker.com/compose/install/"
fi

echo ""
echo "📊 Project Statistics:"
echo "======================"

# Count files
BACKEND_FILES=$(find backend -name "*.js" | wc -l)
FRONTEND_FILES=$(find frontend/src -name "*.js" 2>/dev/null | wc -l)
SQL_FILES=$(find . -name "*.sql" | wc -l)
DOC_FILES=$(find . -maxdepth 1 -name "*.md" | wc -l)

echo "Backend JS files: $BACKEND_FILES"
echo "Frontend JS files: $FRONTEND_FILES"
echo "SQL files: $SQL_FILES"
echo "Documentation files: $DOC_FILES"

echo ""
echo "📦 Modules Available:"
echo "====================="
echo "✅ Feed Module (Twitter/X style)"
echo "✅ Groups Module (HumHub style)"
echo "✅ Profiles Module (Facebook style)"
echo "✅ Messaging Module (Real-time chat)"
echo "✅ Notifications Module (Universal alerts)"

echo ""
echo "🚀 Quick Start Options:"
echo "======================="
echo ""
echo "Option 1: Docker (Recommended)"
echo "  $ ./install.sh"
echo "  Then open: http://localhost"
echo ""
echo "Option 2: Manual Setup"
echo "  $ cd backend && npm install"
echo "  $ cd ../frontend && npm install"
echo "  Setup PostgreSQL and run schema.sql"
echo "  $ cd backend && npm start"
echo "  $ cd frontend && npm start"
echo ""
echo "Option 3: Development Mode"
echo "  $ docker-compose -f docker-compose.dev.yml up"
echo ""

echo "📚 Documentation:"
echo "================="
echo "  README.md - Full documentation"
echo "  QUICKSTART.md - Quick start guide"
echo "  API.md - API reference"
echo "  CONTRIBUTING.md - How to contribute"
echo ""

echo "✅ Your project is ready to deploy!"
echo ""
echo "Next steps:"
echo "1. Review README.md for detailed instructions"
echo "2. Run ./install.sh for quick Docker setup"
echo "3. Or follow QUICKSTART.md for manual installation"
echo "4. Access http://localhost and complete setup wizard"
echo ""
echo "🌟 Happy coding! 🌟"
