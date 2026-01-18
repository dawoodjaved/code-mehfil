# CodePair

Think Google Docs, but for code. With live execution, video calls, and everything else you need for remote pair programming and technical interviews.

I built this because I was tired of juggling between multiple tools during coding interviews and pair programming sessions. Why switch between Zoom, VS Code Live Share, and CoderPad when you can have it all in one place?

## What It Does

CodePair is a real-time collaborative coding platform that brings together everything developers need to code together remotely. Whether you're doing pair programming, conducting technical interviews, or just practicing coding problems, this has you covered.

### The Main Features

**Real-Time Code Collaboration**
- Multiple people can edit code at the same time, just like Google Docs
- See where everyone's cursor is with color-coded indicators
- Changes sync instantly across all participants
- Uses Monaco Editor (same one VS Code uses) so it feels familiar

**Code Execution**
- Run code in 11 different languages instantly
- Supports JavaScript, TypeScript, Python, Java, C++, Go, Rust, Ruby, PHP, Swift, and C
- Works with or without Judge0 API (has fallback execution for common languages)
- See output, errors, and execution time right in the interface

**Interview Mode**
- Built-in timer for timed practice sessions
- Integration with Codeforces API to pull real problems
- Filter problems by difficulty (Easy, Medium, Hard, Expert)
- Browse recent contests and select problems directly
- Test your solutions against test cases

**Video & Audio**
- LiveKit integration for video calls
- Built right into the coding session
- Toggle video/audio on the fly

**Interactive Whiteboard**
- Collaborative drawing with Excalidraw
- Perfect for explaining algorithms or system design
- Export your drawings as PNG or Excalidraw files

**Terminal**
- Built-in terminal for running commands
- Quick shortcuts to execute code
- Full command history

**File Management**
- Create, edit, and delete multiple files
- Organize code in folders
- Language detection based on file extensions
- Quick switching between files

**Session Sharing**
- Share sessions via simple links
- Invite people by email
- Each session has a unique code for quick joining
- View all your sessions in one place

**Live Chat**
- Real-time messaging during coding sessions
- Typing indicators so you know when someone's responding
- Message history preserved

## Tech Stack

**Frontend:**
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Monaco Editor for the code editor
- shadcn/ui components

**Backend:**
- Rails 7.2 API
- PostgreSQL for the database
- ActionCable for WebSocket connections
- JWT for authentication

**Code Execution:**
- Judge0 API (optional - works without it too)
- Fallback execution for JavaScript, Python, Java, C++, Go, Rust, Ruby, PHP, Swift, and C

**Infrastructure:**
- Docker Compose for local development
- PostgreSQL and Redis in containers

## Getting Started

### What You'll Need

- Node.js 18 or higher
- Ruby 3.1+ (I'm using 3.1.4, but 3.2+ should work fine)
- Docker and Docker Compose
- PostgreSQL 15+ (runs in Docker)
- Redis 7+ (runs in Docker)

### Installation

First, clone the repo and install dependencies:

```bash
git clone <your-repo-url>
cd code-pair

# Frontend dependencies
cd frontend
npm install
# or if you use pnpm
pnpm install

# Backend dependencies
cd ../backend
bundle install
```

Set up your environment variables. For the backend, create a `.env` file:

```bash
cd backend
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codepair_development
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=your_secret_key_here
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
EOF
```

For the frontend, create `.env.local`:

```bash
cd ../frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/cable
EOF
```

Start the Docker services (PostgreSQL and Redis):

```bash
# From the root directory
docker-compose up -d
```

Set up the database:

```bash
cd backend
rails db:create
rails db:migrate
rails db:seed  # This adds some sample data if you want
```

Now start the servers. You'll need two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
rails server -p 4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# or
pnpm dev
```

That's it! Open http://localhost:3000 and you should see the homepage. Sign up for an account and start creating sessions.

## How to Use It

### Creating a Session

1. Click "Create Session" or go to `/session/new`
2. Give it a name (or it'll auto-generate one like "Collaboration Session - January 16, 2026")
3. Choose the session type: Collaboration, Interview, or Practice
4. Optionally set a time limit and default language
5. Click "Create Session"

### Sharing a Session

Once you're in a session, click the "Share" button in the top right. You can:
- Copy the session link to share with anyone
- Invite someone by email (they need to have an account)
- Share the session code for quick joining

### Running Code

1. Write your code in the editor
2. Select the language from the dropdown
3. Click "Run Code" or use the terminal command `run`
4. See the output (or errors) appear below the editor

The code execution works even without Judge0 configured - it'll use local fallback execution for JavaScript, Python, and a few other languages. But if you want the full experience with all languages, set up Judge0.

### Interview Mode

1. Switch to the "Interview" tab
2. Click on "Problem Recommender"
3. Either:
   - Click a difficulty filter (Easy, Medium, Hard, Expert) to get recommended problems
   - Browse recent contests and select one to see its problems
4. Click on a problem to load it
5. Click "Start Interview" to begin coding
6. Use the timer if you want timed practice
7. Run tests to check your solution

### Other Tabs

- **Video**: Start a video call with other participants (requires LiveKit setup)
- **Whiteboard**: Draw diagrams together using Excalidraw
- **Terminal**: Run commands, execute code, manage files

## Project Structure

```
code-pair/
├── frontend/              # Next.js app
│   ├── src/
│   │   ├── app/          # Pages (homepage, auth, sessions)
│   │   ├── components/   # React components
│   │   │   ├── editor/   # Monaco editor wrapper
│   │   │   ├── interview/ # Interview mode components
│   │   │   ├── video/    # Video room
│   │   │   ├── whiteboard/ # Whiteboard
│   │   │   └── terminal/ # Terminal component
│   │   ├── lib/          # Utilities
│   │   └── store/        # State management
│   └── package.json
├── backend/              # Rails API
│   ├── app/
│   │   ├── controllers/api/ # API endpoints
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic (Judge0 service)
│   │   ├── jobs/         # Background jobs
│   │   └── channels/     # WebSocket channels
│   ├── db/migrate/       # Database migrations
│   └── Gemfile
└── docker-compose.yml    # Docker setup
```

## API Endpoints

All API endpoints are under `/api`. Here are the main ones:

**Authentication:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

**Sessions:**
- `GET /api/sessions` - List your sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/join` - Join session by code
- `POST /api/sessions/:id/participants` - Invite participant

**Code Execution:**
- `POST /api/sessions/:id/executions` - Run code
- `GET /api/executions/:id` - Get execution status

**Questions:**
- `GET /api/questions` - List coding questions
- `GET /api/questions/:id` - Get question details

Check `backend/config/routes.rb` for the complete list.

## Language Support

The platform supports 11 languages for code execution:

- JavaScript (Node.js)
- TypeScript
- Python (python3)
- Java (javac + java)
- C++ (g++ compiler)
- C (gcc compiler)
- Go (go run)
- Rust (rustc compiler)
- Ruby
- PHP
- Swift

When Judge0 is configured, all languages work through that. Without it, JavaScript, TypeScript, and Python work via local fallback execution. The other languages will show a helpful error message suggesting to configure Judge0.

## Common Issues

**Port already in use:**
```bash
# Kill whatever's on port 3000 or 4000
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

**Database connection errors:**
Make sure Docker is running and PostgreSQL container is up:
```bash
docker-compose ps
docker-compose up -d postgres
```

**Migrations not running:**
If you see errors about missing columns, make sure you ran:
```bash
cd backend
rails db:migrate
```

**Frontend not updating:**
Clear the Next.js cache:
```bash
cd frontend
rm -rf .next
npm run dev
```

## Development

I use RSpec for backend tests and the standard Next.js testing setup for the frontend. There's also some basic linting set up with RuboCop for Ruby and ESLint for TypeScript.

To run tests:
```bash
# Backend
cd backend
bundle exec rspec

# Frontend
cd frontend
npm test
```

## What's Next

This is still a work in progress. Some things I'm thinking about adding:
- Better error handling and user feedback
- More language support in fallback mode
- Session recording/playback
- Better mobile responsiveness
- Performance optimizations for large files

## License

This is a portfolio project, so it's proprietary. Feel free to use it as inspiration for your own projects though!

---

Built because I wanted a better way to code together remotely. Hope you find it useful!
