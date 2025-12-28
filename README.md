# CodePair - Real-Time Collaborative Coding Platform

> **"Google Docs for Code" with live execution**

CodePair is a streamlined real-time code collaboration platform that enables developers to code together seamlessly. Perfect for pair programming, technical interviews, and coding practice sessions.

## 🚀 Features

### Core Features
- **Real-Time Collaborative Editor** - Monaco Editor (VS Code's editor) with WebSocket synchronization and multi-cursor tracking
- **Code Execution** - Instant code execution via Judge0 API supporting 10+ popular languages
- **Live Chat** - Real-time text chat with typing indicators
- **Session Management** - Create shareable sessions, join with links, and view session history
- **Interview Mode** - Built-in timer and curated coding question bank

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind + Monaco Editor + shadcn/ui
- **Backend**: Rails 7.2 API + PostgreSQL + ActionCable WebSockets
- **Code Execution**: Judge0 API (external service)
- **Auth**: JWT-based authentication
- **Infrastructure**: Docker Compose

## 📦 Project Structure

```
codepair/
├── frontend/              # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── auth/              # Sign in/up pages
│   │   │   ├── demo/              # Demo page
│   │   │   └── session/[id]/      # Collaboration session
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   └── store/        # Zustand state
│   └── package.json
├── backend/              # Rails 7.2 API
│   ├── app/
│   │   ├── controllers/  # API controllers
│   │   ├── models/       # ActiveRecord models
│   │   ├── services/     # Business logic
│   │   └── channels/     # WebSocket channels
│   ├── db/migrate/       # Database migrations
│   └── Gemfile
├── docker-compose.yml    # Docker services
└── README.md
```

## 🛠️ Setup

### Prerequisites
- **Node.js** 18+ (use nvm)
- **Ruby** 3.2+
- **Docker & Docker Compose**
- **PostgreSQL** 15+ (via Docker)
- **Redis** 7+ (via Docker)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd CodePair

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
bundle install
cd ..
```

2. **Set up environment variables:**
```bash
# Backend (.env)
cd backend
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codepair_development
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=your_secret_key_here
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
EOF
cd ..

# Frontend (.env.local)
cd frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/cable
EOF
cd ..
```

3. **Start Docker services:**
```bash
docker-compose up -d

# Verify services are running
docker-compose ps
```

4. **Set up Rails database:**
```bash
cd backend
rails db:create
rails db:migrate
rails db:seed  # Optional: Seed with demo questions
cd ..
```

5. **Start development servers:**
```bash
# Terminal 1: Rails API
cd backend
rails server -p 4000

# Terminal 2: Frontend
cd frontend
npm run dev
```

**Access Points:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Rails Console**: `cd backend && rails console`

## 🎯 Quick Start

1. **Start the application:**
   ```bash
   # Start Docker services
   docker-compose up -d
   
   # Start backend (Terminal 1)
   cd backend && rails server -p 4000
   
   # Start frontend (Terminal 2)
   cd frontend && npm run dev
   ```

2. **Access the application:**
   - Open http://localhost:3000
   - Sign up for a new account

3. **Create a coding session:**
   - Create a new session from dashboard
   - Share the session link with collaborators
   - Start coding together in real-time
   - Run code instantly with the execute button

4. **Try interview mode:**
   - Toggle interview mode
   - Select a question from the bank
   - Use the timer for timed practice

## 📚 Key Features Explained

### Real-Time Collaboration
- Multiple users can edit the same file simultaneously
- See other users' cursors with color indicators
- User presence indicators show who's online
- Changes sync instantly via WebSockets

### Code Execution
- Supports Python, JavaScript, Java, C++, Go, TypeScript, PHP, Ruby, Rust, Swift
- Code runs securely via Judge0 API
- View output, errors, and execution time
- No Docker management needed

### Session Management
- Create unlimited coding sessions
- Share sessions with simple URLs
- View session history and saved code
- Resume previous sessions anytime

### Interview Mode
- Pre-loaded coding questions (algorithms, data structures)
- Built-in countdown timer
- Mark sessions as interviews vs practice
- Question difficulty indicators

## 🎨 Available Pages

- **`/`** - Homepage with feature overview
- **`/auth/signin`** - User sign in
- **`/auth/signup`** - User registration
- **`/demo`** - Feature demo
- **`/session/[id]`** - Coding collaboration session

## 🔒 Security

- JWT-based authentication
- Secure WebSocket connections
- Password hashing with bcrypt
- Rate limiting with Rack::Attack
- CORS protection

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Reset Rails database (WARNING: deletes all data)
cd backend
rails db:drop db:create db:migrate
```

### Frontend Not Loading
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### Backend Not Starting
```bash
# Check Ruby version (need 3.2+)
ruby --version

# Reinstall dependencies
cd backend
bundle install
```

## 📊 Simplified Architecture

**What we removed for simplicity:**
- ❌ Y.js CRDT (using simple WebSocket broadcasts)
- ❌ Docker code execution (using Judge0 API)
- ❌ LiveKit/WebRTC video calls
- ❌ AI interviewer features
- ❌ Team workspaces & permissions
- ❌ Session recording/playback
- ❌ Whiteboard collaboration
- ❌ External integrations
- ❌ Sidekiq background jobs (optional)
- ❌ Complex analytics

**What we kept:**
- ✅ Real-time collaborative editing
- ✅ Code execution (via API)
- ✅ Live chat
- ✅ Session management
- ✅ Interview mode basics

## 📝 Development

### Running Tests
```bash
# Backend tests
cd backend
bundle exec rspec

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Backend linting
cd backend
bundle exec rubocop

# Frontend linting
cd frontend
npm run lint
```

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ as a portfolio project
