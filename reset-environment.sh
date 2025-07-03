#!/bin/bash

echo "🔄 Resetting GreenPOS Environment..."

# Kill any running dev servers
echo "🛑 Stopping any running dev servers..."
pkill -f "vite"
pkill -f "npm run dev"

# Clear node modules cache
echo "🧹 Clearing node_modules cache..."
rm -rf node_modules/.vite
rm -rf node_modules/.cache

# Clear dist folder
echo "🧹 Clearing dist folder..."
rm -rf dist

# Verify .env file has correct values
echo "🔍 Checking .env configuration..."
echo "Contract Address in .env:"
grep VITE_MASCHAIN_CONTRACT_ADDRESS .env

# Build fresh
echo "🔨 Building fresh..."
npm run build

# Start dev server
echo "🚀 Starting fresh dev server..."
npm run dev

echo "✅ Environment reset complete!"
echo "🌐 Please open: http://localhost:3002"
echo "🧹 Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "🔍 Check console for: 'FORCED Contract Address: 0x5D25A17d356325927B3C6B68A714E0CAB7fa9238'"
