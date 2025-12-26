#!/bin/bash

# Backup script for Social Hybrid Network

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="social_hybrid_backup_${TIMESTAMP}.sql"

echo "🔄 Starting backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup database
if docker ps | grep -q social-hybrid-db; then
    echo "📦 Backing up database..."
    docker exec social-hybrid-db pg_dump -U postgres social_hybrid > "$BACKUP_DIR/$BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    
    echo "✅ Backup completed: $BACKUP_DIR/${BACKUP_FILE}.gz"
    
    # Keep only last 7 backups
    cd $BACKUP_DIR
    ls -t | tail -n +8 | xargs -r rm --
    
    echo "🗑️  Old backups cleaned up (keeping last 7)"
else
    echo "❌ Database container not running"
    exit 1
fi
