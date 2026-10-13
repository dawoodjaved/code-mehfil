#!/bin/bash

# Creates local .env files with a generated JWT_SECRET (never commit real .env files)

set -euo pipefail

echo "Setting up CodeMehfil environment files..."

JWT_SECRET="$(openssl rand -hex 32)"

echo "Creating backend/.env..."
cat > backend/.env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/codemehfil_development
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=${JWT_SECRET}
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=
RAILS_ENV=development
PORT=4004
CORS_ORIGINS=http://localhost:3400,http://localhost:3005,http://localhost:3000
EOF

echo "Creating frontend/.env.local..."
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4004
NEXT_PUBLIC_CABLE_URL=ws://localhost:4004/cable
NEXT_PUBLIC_APP_URL=http://localhost:3400
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
EOF

echo ""
echo "Done. JWT_SECRET was auto-generated — do not commit backend/.env."
echo "If any secret was previously hardcoded or committed, rotate it now."
