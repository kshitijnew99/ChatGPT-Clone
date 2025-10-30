# AI Chat Platform - ChatGPT Clone

A full-stack AI-powered chat application built with the MERN stack, featuring real-time messaging, conversation memory (STM & LTM), and a beautiful ChatGPT-inspired UI with theme switching.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Memory System](#memory-system)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)

## ✨ Features

### Core Functionality
- 🤖 **AI-Powered Chat**: Real-time conversations with Google Gemini AI
- 💬 **Multiple Chat Sessions**: Create and manage multiple conversation threads
- 🔐 **User Authentication**: Secure JWT-based authentication with httpOnly cookies
- 💾 **Persistent Storage**: Messages stored in MongoDB with per-user chat history
- 🧠 **Advanced Memory System**: 
  - STM (Short-Term Memory): Last 20 messages from current chat
  - LTM (Long-Term Memory): Vector-based semantic search across all user's chats
- ⚡ **Real-Time Communication**: WebSocket-based messaging with Socket.IO

### User Experience
- 🎨 **Theme Switching**: Toggle between dark and light (cyan & white) themes
- 📱 **Responsive Design**: Mobile-first design with hamburger menu
- 💅 **ChatGPT-Inspired UI**: Clean, modern interface matching ChatGPT's aesthetic
- 🔄 **Cross-Session Persistence**: Chat history maintained across logins
- 👤 **User Profile**: Avatar with initials and profile menu
- ✍️ **Rich Text Support**: Markdown-like formatting (bold, italic, lists)
- 😊 **Emoji Support**: Full emoji rendering in messages

### Security
- 🔒 **Authentication Guards**: Protected routes and API endpoints
- 🚪 **Secure Logout**: Proper cleanup of user data and chat state
- 🍪 **Secure Cookies**: httpOnly, SameSite cookies for authentication
- 🛡️ **CORS Protection**: Configured CORS for cross-origin security

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v6
- **Real-Time**: Socket.IO Client
- **HTTP Client**: Axios
- **Styling**: CSS3 with CSS Variables
- **Font**: Segoe UI with emoji support

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB with Mongoose ODM
- **Vector Database**: Pinecone (for LTM)
- **AI Service**: Google Gemini API (gemini-2.5-flash)
- **Real-Time**: Socket.IO Server
- **Authentication**: JWT (jsonwebtoken)
- **Security**: cookie-parser, CORS

### AI & Memory
- **Text Generation**: Google Gemini 2.5 Flash
- **Embeddings**: Google text-embedding-004 (768 dimensions)
- **Vector Search**: Pinecone vector database
- **Memory Architecture**: Dual-memory system (STM + LTM)

## 🏗️ Architecture

### Memory System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Input Message                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  1. Save to MongoDB                          │
│                  2. Generate Embedding                        │
│                  3. Store in Pinecone                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────┐         ┌──────────────────────┐
│   STM (MongoDB)      │         │   LTM (Pinecone)     │
│  - Last 20 msgs      │         │  - Vector search     │
│  - Current chat      │         │  - Top 5 results     │
│  - Chronological     │         │  - Exclude curr chat │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                 │
           └────────────┬────────────────────┘
                        ▼
            ┌─────────────────────┐
            │   Format for Gemini  │
            │   {role, parts}      │
            └──────────┬───────────┘
                       ▼
            ┌─────────────────────┐
            │   Gemini API Call    │
            │   Generate Response  │
            └──────────┬───────────┘
                       ▼
            ┌─────────────────────┐
            │   Save AI Response   │
            │   MongoDB + Pinecone │
            └─────────────────────┘
```

### Authentication Flow

```
User Login
    │
    ├─> JWT Token Generated
    │       │
    │       ├─> Stored in httpOnly Cookie
    │       │
    │       └─> User Info in localStorage
    │
    ├─> Authenticated Requests
    │       │
    │       └─> Cookie Sent Automatically
    │
    └─> Logout
            │
            ├─> Clear Cookie (Backend)
            ├─> Clear localStorage
            └─> Clear Redux State
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Pinecone account and API key
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   cd Project3
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up Environment Variables**
   
   Create `.env` file in the `backend` directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/chatgpt-clone
   JWT_SECRET=your_jwt_secret_key_here
   
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Pinecone Configuration
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX_NAME=chat-memory
   PINECONE_ENVIRONMENT=your_pinecone_environment
   ```

5. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   # or
   npx nodemon server.js
   ```

6. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PINECONE_API_KEY` | Pinecone API key | Yes |
| `PINECONE_INDEX_NAME` | Pinecone index name | Yes |
| `PINECONE_ENVIRONMENT` | Pinecone environment | Yes |

### Frontend

The frontend uses environment variables via Vite:
- API endpoint is hardcoded to `http://localhost:3000`
- For production, update all API URLs in the codebase

## 📁 Project Structure

```
Project3/
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── package.json
│   └── src/
│       ├── app.js                # Express app configuration
│       ├── controllers/
│       │   ├── auth.controllers.js
│       │   └── chat.controller.js
│       ├── db/
│       │   └── db.js             # MongoDB connection
│       ├── middlewares/
│       │   └── auth.middleware.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── chat.model.js
│       │   └── message.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── chat.routes.js
│       ├── services/
│       │   ├── ai.service.js     # Gemini API integration
│       │   └── storage.service.js # Pinecone integration
│       └── sockets/
│           └── socket.server.js  # Socket.IO configuration
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx              # React entry point
        ├── App.jsx               # App routes
        ├── AppRoutes.jsx         # Route configuration
        ├── index.css             # Global styles
        ├── components/
        │   └── chat/
        │       ├── ChatHeader.jsx
        │       ├── ChatMessages.jsx
        │       ├── ChatComposer.jsx
        │       └── SidebarContent.jsx
        ├── pages/
        │   ├── Home.jsx          # Main chat interface
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── store/
        │   ├── store.js          # Redux store
        │   └── chatSlice.js      # Chat state management
        └── styles/
            └── theme.css         # Theme variables & styles
```

## 🔌 API Endpoints

### Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |

### Chat Routes (`/chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chat/` | Create new chat session | Yes |
| GET | `/chat/` | Get all user's chats | Yes |
| GET | `/chat/:chatId/messages` | Get messages for specific chat | Yes |

### Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `ai-message` | Client → Server | Send user message to AI |
| `ai-response` | Server → Client | Receive AI response |

## 🧠 Memory System

### Short-Term Memory (STM)
- **Storage**: MongoDB
- **Scope**: Current chat session only
- **Capacity**: Last 20 messages
- **Order**: Chronological (oldest to newest)
- **Purpose**: Maintain conversation context

### Long-Term Memory (LTM)
- **Storage**: Pinecone (Vector Database)
- **Scope**: All user's chat history
- **Retrieval**: Vector similarity search
- **Capacity**: Top 5 most relevant memories
- **Filter**: Excludes current chat (already in STM)
- **Purpose**: Cross-chat context and knowledge retention

### Memory Integration Flow

1. **User sends message** → Saved to MongoDB + Embedded to Pinecone
2. **Retrieve STM**: Fetch last 20 messages from current chat
3. **Retrieve LTM**: Vector search in Pinecone (exclude current chat)
4. **Combine**: LTM + STM → Full context for AI
5. **AI Response** → Saved to MongoDB + Embedded to Pinecone

## 📸 Screenshots

### Dark Theme
- Clean, modern dark interface
- Purple gradient avatar
- Smooth message transitions

### Light Theme (Cyan & White)
- Fresh cyan and white color scheme
- High contrast for readability
- Professional appearance

### Features Showcase
- Multiple chat sessions
- Real-time AI responses
- Theme toggle button
- Responsive mobile design
- User profile menu

## 🚧 Future Enhancements

### Planned Features
- [ ] File upload support (images, documents)
- [ ] Code syntax highlighting
- [ ] Message editing and deletion
- [ ] Chat export (PDF, TXT)
- [ ] Voice input integration
- [ ] Conversation search
- [ ] Chat sharing functionality
- [ ] Multi-language support
- [ ] Custom AI model selection
- [ ] Message reactions

### Technical Improvements
- [ ] Rate limiting
- [ ] Redis caching
- [ ] WebSocket reconnection logic
- [ ] Progressive Web App (PWA)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Unit and integration tests
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Kshitij**
- GitHub: [@kshitijnew99](https://github.com/kshitijnew99)

## 🙏 Acknowledgments

- OpenAI for ChatGPT inspiration
- Google Gemini for AI capabilities
- Pinecone for vector database
- MongoDB for data storage
- The open-source community

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ and ☕ by Kshitij
