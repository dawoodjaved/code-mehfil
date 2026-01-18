#!/bin/bash
cd "$(dirname "$0")"
export RAILS_ENV=development
export PORT=4000
export DB_USERNAME=dawoodjaveed
export DB_PASSWORD=""
bundle exec rails server -p 4000 -b 0.0.0.0
