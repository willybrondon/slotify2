# Fix 502 Bad Gateway Error on https://skedisy.com/

## Quick Diagnosis

A 502 Bad Gateway error means nginx can't connect to your Node.js backend server. Follow these steps:

## Step 1: SSH into Your Server

```bash
ssh root@your-server-ip
# or
ssh admin@your-server-ip
```

## Step 2: Check if Backend Server is Running

```bash
# Check PM2 status
pm2 list

# Check if backend process exists
pm2 describe backend

# Check backend logs for errors
pm2 logs backend --lines 50
```

**If backend is not running or shows "errored" status:**
```bash
cd /home/admin/backend  # or your backend path
pm2 restart backend
# or
pm2 start index.js --name backend
```

## Step 3: Check if Backend is Listening on Port 5000

```bash
# Check if port 5000 is in use
netstat -tulpn | grep 5000
# or
ss -tulpn | grep 5000

# Test if backend responds locally
curl http://localhost:5000/
```

**If backend is not listening:**
- Check PM2 logs: `pm2 logs backend`
- Check for startup errors
- Verify PORT in .env file

## Step 4: Check MongoDB Connection

```bash
cd /home/admin/backend
cat .env | grep MONGODB_CONNECTION_STRING

# Test MongoDB connection
mongosh "your-mongodb-connection-string"
```

**If MongoDB connection fails:**
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check connection string in .env
- Restart MongoDB if needed: `sudo systemctl restart mongod`

## Step 5: Check Nginx Configuration

```bash
# Check nginx config
sudo nginx -t

# Check nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Check nginx config for correct proxy_pass
sudo cat /etc/nginx/sites-available/skedisy.com | grep proxy_pass
# Should show: proxy_pass http://localhost:5000;
```

**If nginx config is wrong:**
```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/skedisy.com

# Make sure it has:
# proxy_pass http://localhost:5000;

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Common Fixes

### Fix 1: Restart Backend
```bash
pm2 restart backend
pm2 logs backend --lines 20
```

### Fix 2: Restart Nginx
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Fix 3: Check for Code Errors
```bash
cd /home/admin/backend
node index.js
# Look for any error messages
# Press Ctrl+C to stop
```

### Fix 4: Check Environment Variables
```bash
cd /home/admin/backend
cat .env

# Verify these are set:
# - PORT=5000
# - MONGODB_CONNECTION_STRING=...
# - JWT_SECRET=...
# - secretKey=...
```

### Fix 5: Check File Permissions
```bash
cd /home/admin/backend
ls -la

# Fix permissions if needed
sudo chown -R admin:admin /home/admin/backend/
sudo chmod -R 755 /home/admin/backend/
```

## Step 7: Run Diagnostic Script

```bash
cd /home/admin/backend
bash check-server-status.sh
```

This will show you exactly what's wrong.

## Step 8: Check Recent Changes

If the error started after recent code changes:

```bash
# Check git log for recent commits
git log --oneline -10

# Check if there are syntax errors
cd /home/admin/backend
node -c index.js
```

## Most Common Causes:

1. **Backend server crashed** → Check PM2 logs
2. **MongoDB connection failed** → Check MongoDB service and connection string
3. **Port mismatch** → Nginx pointing to wrong port
4. **Missing environment variables** → Check .env file
5. **Code syntax error** → Check server logs

## Quick Restart Sequence:

```bash
# 1. Restart backend
cd /home/admin/backend
pm2 restart backend

# 2. Wait a few seconds
sleep 5

# 3. Check status
pm2 status

# 4. Restart nginx
sudo systemctl restart nginx

# 5. Test
curl http://localhost:5000/
```

## Still Not Working?

1. Check PM2 logs: `pm2 logs backend --err`
2. Check nginx error log: `sudo tail -50 /var/log/nginx/error.log`
3. Check system logs: `journalctl -xe`
4. Verify firewall allows port 5000: `sudo ufw status`

