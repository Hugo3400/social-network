# Utility Scripts

This directory contains helpful scripts for managing your Social Hybrid Network installation.

## Available Scripts

### 🛠️ Installation & Setup

#### `./install.sh`
Quick installer script that:
- Checks Docker installation
- Creates environment file
- Starts all services
- Guides you to the web wizard

**Usage:**
```bash
./install.sh
```

---

### 💾 Backup & Restore

#### `./scripts/backup.sh`
Creates a compressed backup of your PostgreSQL database.

**Features:**
- Automatic timestamping
- Gzip compression
- Keeps last 7 backups
- Stores in `./backups/` directory

**Usage:**
```bash
./scripts/backup.sh
```

**Output:**
```
backups/social_hybrid_backup_20251226_143000.sql.gz
```

#### `./scripts/restore.sh`
Restores database from a backup file.

**Usage:**
```bash
./scripts/restore.sh backups/social_hybrid_backup_20251226_143000.sql.gz
```

**⚠️ Warning:** This will replace all current data!

---

### 🔄 Updates

#### `./scripts/update.sh`
Updates your installation to the latest version.

**What it does:**
- Pulls latest changes from Git
- Updates backend dependencies
- Updates frontend dependencies
- Rebuilds Docker images
- Restarts services

**Usage:**
```bash
./scripts/update.sh
```

---

### 🏥 Health Check

#### `./scripts/health-check.sh`
Comprehensive health check for your installation.

**Checks:**
- Docker status
- Container status
- Database connection
- Backend API responsiveness
- Frontend availability
- Disk usage
- Recent logs

**Usage:**
```bash
./scripts/health-check.sh
```

---

## Automated Backups

To set up automated daily backups, add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /path/to/social-network/scripts/backup.sh
```

---

## Best Practices

1. **Regular Backups**
   - Run backup before updates
   - Schedule automatic daily backups
   - Test restores periodically

2. **Health Monitoring**
   - Run health check after deployments
   - Schedule periodic health checks
   - Monitor logs for errors

3. **Updates**
   - Backup before updating
   - Test in development first
   - Read changelog before updating

4. **Security**
   - Keep scripts executable permissions restricted
   - Don't commit backup files to Git
   - Secure backup storage location

---

## Troubleshooting

### Script not executable
```bash
chmod +x scripts/*.sh
chmod +x install.sh
```

### Backup fails
- Check if Docker container is running: `docker-compose ps`
- Verify database credentials
- Ensure enough disk space

### Restore fails
- Check backup file exists and is readable
- Verify database container is running
- Check PostgreSQL logs: `docker-compose logs postgres`

---

## Custom Scripts

You can add your own scripts to this directory:

```bash
# Example: Send backup to remote server
#!/bin/bash
./scripts/backup.sh
scp backups/*.sql.gz user@remote-server:/backups/
```

---

For more information, see the main [README.md](../README.md)
