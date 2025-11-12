# How to Check if Salonportal is Working on Digital Ocean VPS

## Step 1: SSH into your VPS
```bash
ssh root@46.101.229.176
# or
ssh admin@46.101.229.176
```

## Step 2: Check if files exist

### Check salonportal files:
```bash
ls -la /home/admin/backend/salonportal/
# Should show: index.html, styles.css, script.js, privacy.html, terms.html
```

### Check salon panel files:
```bash
ls -la /home/admin/backend/salon/
# Should show: index.html and static/ folder
```

### Check if index.html exists:
```bash
ls -la /home/admin/backend/salon/index.html
ls -la /home/admin/backend/salonportal/index.html
```

## Step 3: Check Node.js backend is running

```bash
# Check if PM2 is running the backend
pm2 list

# Check backend logs
pm2 logs backend

# Check if process is listening on port 5000
netstat -tulpn | grep 5000
# or
ss -tulpn | grep 5000
```

## Step 4: Check Nginx configuration

```bash
# Check Nginx config
sudo cat /etc/nginx/sites-available/skedisy.com

# Test Nginx config
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/skedisy.error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/skedisy.access.log
```

## Step 5: Check file permissions

```bash
# Check ownership
ls -la /home/admin/backend/

# Fix permissions if needed
sudo chown -R admin:admin /home/admin/backend/
sudo chmod -R 755 /home/admin/backend/
```

## Step 6: Test locally on server

```bash
# Test if backend responds
curl http://localhost:5000/

# Test salonpanel route
curl http://localhost:5000/salonpanel/

# Test with headers
curl -I http://localhost:5000/salonpanel/
```

## Step 7: Restart services if needed

```bash
# Restart backend
pm2 restart backend
# or
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (without downtime)
sudo nginx -s reload
```

## Common Issues and Fixes

### Issue 1: 403 Forbidden
- **Cause**: File permissions or Nginx configuration
- **Fix**: 
  ```bash
  sudo chown -R admin:admin /home/admin/backend/
  sudo chmod -R 755 /home/admin/backend/
  ```

### Issue 2: ENOENT - File not found
- **Cause**: Files not deployed or wrong path
- **Fix**: 
  ```bash
  # Check if salon build exists
  ls -la /home/admin/backend/salon/
  
  # If missing, you need to build and deploy the salon frontend
  cd /home/admin/salon
  npm run build
  # Then copy build files to /home/admin/backend/salon/
  ```

### Issue 3: Backend not running
- **Cause**: PM2 process stopped or crashed
- **Fix**:
  ```bash
  cd /home/admin/backend
  pm2 start index.js --name backend
  pm2 save
  ```

### Issue 4: Nginx not proxying correctly
- **Cause**: Nginx config issue
- **Fix**:
  ```bash
  # Edit config
  sudo nano /etc/nginx/sites-available/skedisy.com
  
  # Test and reload
  sudo nginx -t
  sudo systemctl reload nginx
  ```

## Quick Diagnostic Commands

Run these to get a full picture:

```bash
echo "=== File Check ==="
ls -la /home/admin/backend/salon/index.html 2>&1
ls -la /home/admin/backend/salonportal/index.html 2>&1

echo "=== Process Check ==="
pm2 list
ps aux | grep node

echo "=== Port Check ==="
netstat -tulpn | grep 5000

echo "=== Nginx Check ==="
sudo systemctl status nginx
sudo nginx -t

echo "=== Test Backend ==="
curl -I http://localhost:5000/salonpanel/ 2>&1
```

