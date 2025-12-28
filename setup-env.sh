#!/bin/bash

# CodePair - Environment Setup Script
# This script creates .env files for backend and frontend with default values

echo "🚀 Setting up CodePair environment files..."

# Backend .env
echo "📝 Creating backend/.env..."
cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codepair_development

# Redis Configuration
REDIS_URL=redis://localhost:6379/1

# JWT Configuration
JWT_SECRET=your_secret_key_change_this_in_production

# Judge0 API Configuration (Get your API key from RapidAPI)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here

# Rails Environment
RAILS_ENV=development
PORT=4000
EOF

# Frontend .env.local
echo "📝 Creating frontend/.env.local..."
cat > frontend/.env.local << 'EOF'
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:4000/cable

# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo ""
echo "✅ Environment files created successfully!"
echo ""
echo "⚠️  IMPORTANT: Update the following values:"
echo "   1. backend/.env: JWT_SECRET (generate a secure random string)"
echo "   2. backend/.env: JUDGE0_API_KEY (get from https://rapidapi.com/judge0-official/api/judge0-ce)"
echo ""
echo "📚 Next steps:"
echo "   1. Start Docker services: docker-compose up -d"
echo "   2. Set up database: cd backend && rails db:create db:migrate db:seed"
echo "   3. Start backend: cd backend && rails server -p 4000"
echo "   4. Start frontend: cd frontend && npm run dev"
echo ""
echo "🎉 Happy coding with CodePair!"
