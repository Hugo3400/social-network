# API Reference

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3001/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Setup Endpoints

### Test Database Connection

```http
POST /api/setup/test-db
```

**Body:**
```json
{
  "host": "localhost",
  "port": 5432,
  "database": "social_hybrid",
  "user": "postgres",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful"
}
```

### Initialize Database

```http
POST /api/setup/init-db
```

**Body:** Same as test-db

### Create Admin User

```http
POST /api/setup/create-admin
```

**Body:**
```json
{
  "dbConfig": { /* database config */ },
  "adminData": {
    "username": "admin",
    "email": "admin@example.com",
    "password": "securepassword",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

### Save Configuration

```http
POST /api/setup/save-config
```

**Body:** Complete configuration object

---

## Authentication

### Register

```http
POST /api/auth/register
```

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "jwt_token_here"
}
```

### Login

```http
POST /api/auth/login
```

**Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { /* user object */ },
  "token": "jwt_token_here"
}
```

### Verify Token

```http
GET /api/auth/verify
```

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "valid": true,
  "user": { /* user object */ }
}
```

---

## Feed

### Get Feed

```http
GET /api/feed?page=1&limit=20
```

**Response:**
```json
{
  "posts": [
    {
      "id": 1,
      "content": "Hello world!",
      "user_id": 1,
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "...",
      "like_count": 5,
      "comment_count": 2,
      "user_liked": false,
      "created_at": "2025-12-26T10:00:00.000Z"
    }
  ],
  "page": 1,
  "hasMore": true
}
```

### Create Post

```http
POST /api/feed
```

**Body:**
```json
{
  "content": "This is my post! #awesome",
  "mediaUrl": "https://...",
  "mediaType": "image/jpeg",
  "visibility": "public"
}
```

### Like Post

```http
POST /api/feed/:id/like
```

**Response:**
```json
{
  "liked": true
}
```

### Repost

```http
POST /api/feed/:id/repost
```

**Body:**
```json
{
  "content": "Check this out!"
}
```

### Get Comments

```http
GET /api/feed/:id/comments
```

### Add Comment

```http
POST /api/feed/:id/comments
```

**Body:**
```json
{
  "content": "Great post!"
}
```

### Delete Post

```http
DELETE /api/feed/:id
```

### Search by Hashtag

```http
GET /api/feed/hashtag/:tag
```

---

## Groups

### List Groups

```http
GET /api/groups?search=keyword&page=1&limit=20
```

### Get User's Groups

```http
GET /api/groups/my-groups
```

### Create Group

```http
POST /api/groups
```

**Body:**
```json
{
  "name": "Awesome Group",
  "description": "A great community",
  "visibility": "public",
  "joinPolicy": "open"
}
```

### Get Group Details

```http
GET /api/groups/:id
```

### Join Group

```http
POST /api/groups/:id/join
```

### Leave Group

```http
POST /api/groups/:id/leave
```

### Get Group Posts

```http
GET /api/groups/:id/posts?page=1&limit=20
```

### Create Group Post

```http
POST /api/groups/:id/posts
```

**Body:**
```json
{
  "content": "Group announcement!",
  "mediaUrl": "..."
}
```

### Get Group Members

```http
GET /api/groups/:id/members
```

---

## Profiles

### Get Profile

```http
GET /api/profiles/:userId
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "...",
  "bio": "Software developer",
  "cover_photo_url": "...",
  "location": "New York",
  "website": "https://...",
  "friend_count": 42,
  "follower_count": 100,
  "post_count": 50
}
```

### Update Profile

```http
PUT /api/profiles/:userId
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "location": "San Francisco",
  "website": "https://...",
  "about": "...",
  "work": "...",
  "education": "..."
}
```

### Update Privacy Settings

```http
PUT /api/profiles/:userId/privacy
```

**Body:**
```json
{
  "privacySettings": {
    "profile": "public",
    "posts": "friends",
    "friends": "friends"
  }
}
```

### Get Friends

```http
GET /api/profiles/:userId/friends
```

### Send Friend Request

```http
POST /api/profiles/:userId/friend-request
```

### Accept/Reject Friend Request

```http
POST /api/profiles/friend-request/:requestId/:action
```

Where `:action` is either `accept` or `reject`.

### Follow User

```http
POST /api/profiles/:userId/follow
```

### Unfollow User

```http
POST /api/profiles/:userId/unfollow
```

### Get User Posts

```http
GET /api/profiles/:userId/posts?page=1&limit=20
```

---

## Messaging

### Get Conversations

```http
GET /api/messages
```

### Create Conversation

```http
POST /api/messages
```

**Body:**
```json
{
  "participantIds": [2, 3],
  "isGroupChat": false,
  "name": "Group Chat Name"
}
```

### Get Conversation Details

```http
GET /api/messages/:conversationId
```

### Get Messages

```http
GET /api/messages/:conversationId/messages?page=1&limit=50
```

### Send Message

```http
POST /api/messages/:conversationId/messages
```

**Body:**
```json
{
  "content": "Hello!",
  "mediaUrl": "..."
}
```

### Mark as Read

```http
POST /api/messages/:conversationId/mark-read
```

---

## Notifications

### Get Notifications

```http
GET /api/notifications?page=1&limit=20&unreadOnly=false
```

### Get Unread Count

```http
GET /api/notifications/unread-count
```

**Response:**
```json
{
  "count": 5
}
```

### Mark as Read

```http
PUT /api/notifications/:id/read
```

### Mark All as Read

```http
PUT /api/notifications/mark-all-read
```

### Delete Notification

```http
DELETE /api/notifications/:id
```

---

## Users

### Get User

```http
GET /api/users/:id
```

### Update User

```http
PUT /api/users/:id
```

### Search Users

```http
GET /api/users/search/:query
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message",
  "details": "Additional details (in development mode)"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse. If you exceed the limit, you'll receive a `429 Too Many Requests` response.

---

## WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

### Events

#### Messaging

```javascript
// Join conversation
socket.emit('join_conversation', conversationId);

// Send message
socket.emit('send_message', {
  conversationId: 1,
  content: 'Hello!'
});

// Receive message
socket.on('new_message', (data) => {
  console.log('New message:', data);
});

// Typing indicators
socket.emit('typing_start', conversationId);
socket.emit('typing_stop', conversationId);

socket.on('user_typing', (data) => {
  console.log('User typing:', data.userId);
});
```

#### Notifications

```javascript
// Receive notification
socket.on('new_notification', (notification) => {
  console.log('New notification:', notification);
});
```

---

## Pagination

Most list endpoints support pagination:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Response includes:
- `page` - Current page
- `hasMore` - Whether more items exist

---

This API documentation covers the main endpoints. For more details, see the source code or contact the development team.
