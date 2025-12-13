#!/bin/bash

# Quick fix script to update baseURL on VPS and rebuild frontend
# Run this on your VPS to fix the 404 login error

echo "=========================================="
echo "Fixing baseURL configuration..."
echo "=========================================="

# Navigate to frontend util directory
cd /home/admin/frontend/src/util || exit

# Get existing secret key and project name (if they exist)
if [ -f "config.js" ]; then
    SECRET_KEY=$(grep "secretKey" config.js | sed "s/.*= \"\(.*\)\";/\1/")
    PROJECT_NAME=$(grep "projectName" config.js | sed "s/.*= \"\(.*\)\";/\1/")
else
    echo "⚠️  config.js not found, using defaults"
    SECRET_KEY="5TIvw5cpc0"
    PROJECT_NAME="skedisy"
fi

# Update config.js with correct baseURL
cat > config.js << EOF
export const baseURL = "/api";
export const secretKey = "${SECRET_KEY:-5TIvw5cpc0}";
export const projectName = "${PROJECT_NAME:-skedisy}";
EOF

echo "✅ Updated config.js with baseURL = '/api'"
echo ""

# Navigate to frontend directory
cd /home/admin/frontend || exit

echo "=========================================="
echo "Rebuilding frontend..."
echo "=========================================="

# Ensure Node.js is in PATH
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc 2>/dev/null || true

# Build frontend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
    echo ""
    
    echo "=========================================="
    echo "Copying build to backend public folder..."
    echo "=========================================="
    
    # Remove old build files
    sudo rm -rf /home/admin/backend/public/*
    
    # Copy new build
    sudo mv /home/admin/frontend/build/* /home/admin/backend/public/
    
    echo "✅ Build files copied to backend/public"
    echo ""
    
    echo "=========================================="
    echo "Restarting backend..."
    echo "=========================================="
    
    # Restart backend
    pm2 restart backend
    
    echo "✅ Backend restarted"
    echo ""
    echo "=========================================="
    echo "✅ Fix complete!"
    echo "=========================================="
    echo ""
    echo "Now try logging in. The API calls should go to /api/admin/login"
    echo "Check logs with: pm2 logs backend --lines 0"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

