# 🚀 Quick Start Guide

## First-Time Installation (Using Web Wizard)

### Step 1: Prerequisites

Make sure you have installed:
- Docker and Docker Compose
- OR Node.js 18+ and PostgreSQL 15+

### Step 2: Clone and Start

```bash
# Clone the repository
git clone https://github.com/Hugo3400/social-network.git
cd social-network

# Start with Docker (easiest)
docker-compose up -d

# Wait 30 seconds for services to start
# Then open http://localhost in your browser
```

### Step 3: Setup Wizard

You'll be automatically redirected to `/setup`. Fill in:

1. **Database Configuration**
   - Host: `postgres` (if using Docker) or `localhost`
   - Port: `5432`
   - Database: `social_hybrid`
   - User: `postgres`
   - Password: Your choice (use `changeme` for Docker default)

2. **Server Configuration**
   - Port: `3001` (default)
   - Host: `localhost`

3. **Admin Account**
   - Username: Your choice
   - Email: Your admin email
   - Password: Secure password (min 6 chars)
   - First/Last Name: Your name

4. **Modules**
   - Select which features to enable (all enabled by default)

5. **Finalize**
   - Click "Install Now"
   - Wait for initialization
   - Automatic redirect to login page

### Step 4: Login

Use your admin credentials to log in!

---

## Manual Installation (Without Docker)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb social_hybrid

# Run schema
psql -d social_hybrid -f backend/app/db/schema.sql
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
nano .env  # Edit with your settings
```

### 4. Start Services

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### 5. Open Browser

Navigate to `http://localhost:3000` and complete the setup wizard.

---

## Production Deployment

### Using Docker Compose

```bash
# 1. Set production password
cp .env.docker.example .env
nano .env  # Set DB_PASSWORD

# 2. Build and start
docker-compose up -d

# 3. Check status
docker-compose ps
docker-compose logs -f

# 4. Open http://your-domain.com
```

### Manual Production Setup

1. Set `NODE_ENV=production` in backend/.env
2. Build frontend: `cd frontend && npm run build`
3. Configure Nginx to serve frontend build and proxy API
4. Use PM2 to run backend: `pm2 start backend/server.js`
5. Set up SSL with Let's Encrypt

---

## Troubleshooting

### Cannot connect to database
- Check if PostgreSQL is running: `docker-compose ps` or `systemctl status postgresql`
- Verify credentials in `.env` file
- Check if database exists: `psql -l`

### Port already in use
- Stop conflicting services: `sudo lsof -i :3001` or `sudo lsof -i :80`
- Or change ports in docker-compose.yml

### Frontend not loading
- Check backend is running: `curl http://localhost:3001/api/health`
- Clear browser cache
- Check Docker logs: `docker-compose logs frontend`

### Permission errors
- Ensure proper file permissions: `chmod -R 755 backend frontend`
- For Docker volumes: `docker-compose down -v` and restart

---

## Default Ports

- Frontend: `80` (production) or `3000` (development)
- Backend API: `3001`
- PostgreSQL: `5432`
- Socket.io: Same as backend (3001)

---

## Useful Commands

```bash
# Docker
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose restart        # Restart
docker-compose logs -f        # View logs
docker-compose ps             # Status

# Database backup
docker exec social-hybrid-db pg_dump -U postgres social_hybrid > backup.sql

# Database restore
docker exec -i social-hybrid-db psql -U postgres social_hybrid < backup.sql

# Reset everything (WARNING: deletes data!)
docker-compose down -v
docker-compose up -d
```

---

## Next Steps

After installation:

1. Explore the feed and create your first post
2. Create groups/communities
3. Invite users (they can register at `/register`)
4. Configure modules in `backend/config/config.json`
5. Customize privacy settings
6. Set up email notifications (coming soon)
7. Configure backups

---

## Getting Help

- Read the full [README.md](README.md)
- Check [Issues](https://github.com/Hugo3400/social-network/issues)
- Review API documentation in README
- Join our community (coming soon)

---

Happy networking! 🎉
