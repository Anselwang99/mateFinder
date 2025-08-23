# MateFinder

A location-based social app that connects nearby people for chatting.

## Features

-   **User Authentication:** Register, login, and profile management
-   **Location Services:** Find users nearby based on geolocation
-   **Real-time Chat:** Instant messaging between users
-   **User Profiles:** View profiles with photos, bio, and interests

## Tech Stack

-   **Backend:** Node.js with Express
-   **Database:** MongoDB with Mongoose
-   **Real-time Communication:** Socket.IO
-   **Authentication:** JWT (JSON Web Tokens)

## Prerequisites

-   Node.js (v14+)
-   MongoDB (local or Atlas)
-   npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/mateFinder.git
cd mateFinder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/matefinder
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=90d
MAX_DISTANCE_KM=10
```

### 4. Run the server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

-   `POST /api/users/signup` - Register new user
-   `POST /api/users/login` - Login user

### User Profile

-   `GET /api/users/me` - Get current user profile
-   `PATCH /api/users/updateMe` - Update current user profile
-   `PATCH /api/users/updateMyPassword` - Update current user password

### Location

-   `PATCH /api/locations/update` - Update current user's location
-   `GET /api/locations/nearby` - Find users nearby

### Chat

-   `GET /api/chats` - Get all chats for current user
-   `POST /api/chats` - Create a new chat with another user
-   `GET /api/chats/:chatId` - Get a specific chat by ID
-   `POST /api/chats/:chatId/messages` - Send a message in a chat

## WebSocket Events

### Connection

-   Connect with authentication token in handshake auth

### Events

-   `chat:join` - Join a chat room
-   `chat:message` - Send a message to a chat
-   `chat:typing` - Send typing indicator
-   `location:update` - Update user's location

## License

MIT
