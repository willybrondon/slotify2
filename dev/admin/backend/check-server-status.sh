#!/bin/bash

# Server Status Check Script for Skedisy
# This script helps diagnose 502 Bad Gateway errors

echo "=========================================="
echo "Skedisy Server Status Check"
echo "=========================================="
echo ""

# Check if Node.js is installed
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js version: $(node -v)"
else
    echo "   ✗ Node.js is NOT installed"
    exit 1
fi

# Check if PM2 is installed
echo ""
echo "2. Checking PM2..."
if command -v pm2 &> /dev/null; then
    echo "   ✓ PM2 is installed"
    echo ""
    echo "   PM2 Process List:"
    pm2 list
    echo ""
    echo "   PM2 Logs (last 20 lines):"
    pm2 logs backend --lines 20 --nostream
else
    echo "   ⚠ PM2 is NOT installed (server might be running differently)"
fi

# Check if backend process is running
echo ""
echo "3. Checking if backend is listening on port 5000..."
if netstat -tulpn 2>/dev/null | grep -q ":5000" || ss -tulpn 2>/dev/null | grep -q ":5000"; then
    echo "   ✓ Backend is listening on port 5000"
    netstat -tulpn 2>/dev/null | grep ":5000" || ss -tulpn 2>/dev/null | grep ":5000"
else
    echo "   ✗ Backend is NOT listening on port 5000"
    echo "   This is likely the cause of the 502 error!"
fi

# Check MongoDB connection
echo ""
echo "4. Checking MongoDB connection..."
if [ -f ".env" ]; then
    echo "   ✓ .env file exists"
    if grep -q "MONGODB_CONNECTION_STRING" .env; then
        echo "   ✓ MONGODB_CONNECTION_STRING is set in .env"
    else
        echo "   ✗ MONGODB_CONNECTION_STRING is NOT set in .env"
    fi
else
    echo "   ✗ .env file NOT found in current directory"
    echo "   Current directory: $(pwd)"
fi

# Check Nginx status
echo ""
echo "5. Checking Nginx..."
if systemctl is-active --quiet nginx; then
    echo "   ✓ Nginx is running"
    
    # Check Nginx config
    echo ""
    echo "   Nginx configuration test:"
    sudo nginx -t 2>&1 | head -5
    
    # Check Nginx error logs
    echo ""
    echo "   Recent Nginx errors (last 10 lines):"
    sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "   Could not read error log"
else
    echo "   ✗ Nginx is NOT running"
fi

# Check if backend responds locally
echo ""
echo "6. Testing backend locally..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ | grep -q "200\|301\|302"; then
    echo "   ✓ Backend responds on localhost:5000"
else
    echo "   ✗ Backend does NOT respond on localhost:5000"
    echo "   This confirms the 502 error - backend is down!"
fi

# Check recent backend errors
echo ""
echo "7. Recent backend errors (if PM2 logs available):"
if command -v pm2 &> /dev/null; then
    pm2 logs backend --err --lines 10 --nostream 2>/dev/null || echo "   No PM2 logs available"
fi

echo ""
echo "=========================================="
echo "Diagnosis Complete"
echo "=========================================="
echo ""
echo "Common fixes:"
echo "1. If backend is not running: pm2 start index.js --name backend"
echo "2. If backend crashed: pm2 restart backend"
echo "3. If MongoDB connection failed: Check .env file and MongoDB service"
echo "4. If port mismatch: Check nginx config points to port 5000"
echo "5. Restart nginx: sudo systemctl restart nginx"
echo ""

