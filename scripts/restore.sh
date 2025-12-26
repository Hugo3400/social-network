#!/bin/bash

# Restore script for Social Hybrid Network

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh backups/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will replace all current data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "🔄 Restoring from backup..."

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Decompressing backup..."
    gunzip -c "$BACKUP_FILE" > temp_restore.sql
    RESTORE_FILE="temp_restore.sql"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Restore to database
echo "📥 Restoring database..."
docker exec -i social-hybrid-db psql -U postgres social_hybrid < "$RESTORE_FILE"

# Cleanup
if [ -f "temp_restore.sql" ]; then
    rm temp_restore.sql
fi

echo "✅ Restore completed successfully!"
