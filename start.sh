#!/bin/bash

# CodePair - Quick Start Script
# This script will set up and start your CodePair backend

set -e  # Exit on error

echo "🚀 CodePair - Quick Start Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: backend directory not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"

# Check Ruby
if ! command -v ruby &> /dev/null; then
    echo -e "${RED}❌ Ruby is not installed${NC}"
    echo "Please install Ruby 3.2.0 or higher"
    exit 1
fi
echo -e "${GREEN}✅ Ruby $(ruby -v | awk '{print $2}')${NC}"

# Check Rails
if ! command -v rails &> /dev/null; then
    echo -e "${YELLOW}⚠️  Rails not found. Installing...${NC}"
    gem install rails
fi
echo -e "${GREEN}✅ Rails $(rails -v)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null && ! docker ps | grep -q postgres; then
    echo -e "${RED}❌ PostgreSQL not found${NC}"
    echo "Starting PostgreSQL with Docker..."
    docker-compose up -d postgres
fi
echo -e "${GREEN}✅ PostgreSQL available${NC}"

# Check Redis
if ! command -v redis-cli &> /dev/null && ! docker ps | grep -q redis; then
    echo -e "${RED}❌ Redis not found${NC}"
    echo "Starting Redis with Docker..."
    docker-compose up -d redis
fi
echo -e "${GREEN}✅ Redis available${NC}"

echo ""
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
cd backend
if [ ! -d "vendor/bundle" ]; then
    bundle install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

echo ""
echo -e "${YELLOW}⚙️  Step 3: Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codepair_development
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=$(openssl rand -hex 32)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
RAILS_ENV=development
PORT=4000
CORS_ORIGINS=http://localhost:3000,http://localhost:3003
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Don't forget to add your Judge0 API key to backend/.env${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

echo ""
echo -e "${YELLOW}🗄️  Step 4: Setting up database...${NC}"
if rails db:version &> /dev/null; then
    echo -e "${GREEN}✅ Database exists${NC}"
else
    echo "Creating database..."
    rails db:create
fi

echo "Running migrations..."
rails db:migrate

if [ "$1" == "--seed" ] || [ "$1" == "-s" ]; then
    echo "Seeding database..."
    rails db:seed
    echo -e "${GREEN}✅ Database seeded${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 CodePair Backend is Ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 To start the server:"
echo "   cd backend && rails server -p 4000"
echo ""
echo "🧪 To test the API:"
echo "   curl http://localhost:4001/api/health"
echo ""
echo "👤 Test Users (password: password123):"
echo "   - john@example.com"
echo "   - jane@example.com"
echo "   - bob@example.com"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: SETUP_AND_RUN_GUIDE.md"
echo "   - Status: IMPLEMENTATION_STATUS.md"
echo "   - README: README.md"
echo ""
echo "🔑 Don't forget to:"
echo "   1. Get Judge0 API key from: https://rapidapi.com/judge0-official/api/judge0-ce"
echo "   2. Update backend/.env with your API key"
echo ""
echo -e "${YELLOW}Would you like to start the server now? (y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo -e "${GREEN}🚀 Starting Rails server...${NC}"
    rails server -p 4000
fi

