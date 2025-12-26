# 🚀 Social Hybrid Network

A modern, open-source hybrid social network platform combining the best features of HumHub, Twitter/X, and Facebook.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

## ✨ Features

### 🌟 Core Modules

- **📱 Public Feed (Twitter/X Style)**
  - Short posts with media support
  - Likes, comments, and reposts
  - Hashtag support
  - Real-time updates

- **👥 Groups & Communities (HumHub Style)**
  - Public and private groups
  - Group posts and discussions
  - Member roles (admin, moderator, member)
  - Join policies (open, approval, invite)

- **👤 Extended Profiles (Facebook Style)**
  - Complete user profiles
  - Friend requests and followers
  - Privacy settings
  - Activity timeline

- **💬 Private Messaging**
  - Real-time direct messages
  - Group chats
  - Read receipts
  - Typing indicators

- **🔔 Notifications**
  - Universal notification system
  - Real-time alerts
  - Activity tracking

## 🎯 Installation

### Method 1: Web Wizard (Recommended - No Commands!)

This is the easiest way to get started. Just follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hugo3400/social-network.git
   cd social-network
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Open your browser**
   - Navigate to `http://localhost`
   - You'll automatically be redirected to the setup wizard at `/setup`

4. **Complete the wizard**
   - **Step 1**: Configure database connection (PostgreSQL)
   - **Step 2**: Set server configuration
   - **Step 3**: Create admin account
   - **Step 4**: Select modules to enable
   - **Step 5**: Finalize installation

5. **Done!** 🎉
   - The system will automatically:
     - Initialize the database
     - Create all tables
     - Set up the admin account
     - Generate configuration files
     - Start the application

### Method 2: Manual Installation

#### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Git

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
nano .env

# Initialize database (run schema.sql in your PostgreSQL)
psql -U postgres -d social_hybrid -f app/db/schema.sql

# Start backend server
npm start
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Or build for production
npm run build
```

## 🐳 Docker Deployment

### Production

```bash
# Copy environment file
cp .env.docker.example .env

# Edit .env and set your DB_PASSWORD
nano .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

### Development

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up

# Frontend will be at http://localhost:3000
# Backend will be at http://localhost:3001
```

## 📁 Project Structure

```
social-hybrid/
│
├── backend/                    # Node.js/Express backend
│   ├── app/
│   │   ├── db/                # Database connection and schema
│   │   ├── routes/            # API routes (auth, users, setup)
│   │   ├── middleware/        # Authentication middleware
│   │   └── sockets/           # Socket.io handlers
│   ├── modules/               # Social modules
│   │   ├── feed/              # Public feed module
│   │   ├── groups/            # Groups & communities
│   │   ├── profiles/          # User profiles
│   │   ├── messaging/         # Private messaging
│   │   └── notifications/     # Notification system
│   ├── config/                # Configuration files
│   ├── package.json
│   ├── server.js
│   └── Dockerfile
│
├── frontend/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Setup/         # Installation wizard
│   │   │   ├── Auth/          # Login/Register
│   │   │   ├── Dashboard/     # Main dashboard
│   │   │   ├── Feed/          # Feed page
│   │   │   ├── Groups/        # Groups page
│   │   │   ├── Profile/       # Profile page
│   │   │   ├── Messages/      # Messaging page
│   │   │   └── Notifications/ # Notifications page
│   │   ├── context/           # React context (Auth)
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml          # Production Docker setup
├── docker-compose.dev.yml      # Development Docker setup
├── .gitignore
├── LICENSE
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=social_hybrid
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Security
JWT_SECRET=your_random_jwt_secret
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10
```

### Module Configuration

After installation, you can enable/disable modules by editing `backend/config/config.json`:

```json
{
  "modules": {
    "feed": true,
    "groups": true,
    "profiles": true,
    "messaging": true,
    "notifications": true
  }
}
```

## 📡 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Feed

- `GET /api/feed` - Get feed posts
- `POST /api/feed` - Create post
- `POST /api/feed/:id/like` - Like/unlike post
- `POST /api/feed/:id/repost` - Repost
- `GET /api/feed/:id/comments` - Get comments
- `POST /api/feed/:id/comments` - Add comment

### Groups

- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group
- `GET /api/groups/:id/posts` - Get group posts
- `POST /api/groups/:id/posts` - Create group post

### Profiles

- `GET /api/profiles/:userId` - Get user profile
- `PUT /api/profiles/:userId` - Update profile
- `GET /api/profiles/:userId/friends` - Get friends
- `POST /api/profiles/:userId/friend-request` - Send friend request
- `POST /api/profiles/:userId/follow` - Follow user

### Messaging

- `GET /api/messages` - Get conversations
- `POST /api/messages` - Create conversation
- `GET /api/messages/:id/messages` - Get messages
- `POST /api/messages/:id/messages` - Send message

### Notifications

- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Helmet.js security headers
- SQL injection prevention
- XSS protection

## 🌐 Deployment

### VPS Deployment

1. Clone the repository on your VPS
2. Set up PostgreSQL database
3. Configure environment variables
4. Use Docker Compose for easy deployment
5. Set up reverse proxy (nginx) for SSL/HTTPS

### Recommended Hosting

- **VPS**: DigitalOcean, Linode, Vultr, Hetzner
- **Database**: Managed PostgreSQL or self-hosted
- **Domain**: Any domain registrar
- **SSL**: Let's Encrypt (free)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by HumHub, Twitter/X, and Facebook
- Built with Node.js, React, and PostgreSQL
- Material-UI for the frontend components
- Socket.io for real-time features

## 📧 Support

For support, please open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced search and filters
- [ ] Media gallery
- [ ] Events and calendar
- [ ] Polls and surveys
- [ ] Video calls integration
- [ ] Multiple language support
- [ ] Theme customization
- [ ] Plugin system
- [ ] Analytics dashboard

## 📊 Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Material-UI
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Containerization**: Docker
- **Reverse Proxy**: Nginx

---

Made with ❤️ by the Social Hybrid Network team

**Repository**: https://github.com/Hugo3400/social-network
