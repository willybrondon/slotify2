#!/bin/bash
# Rebuild & redeploy salon panel after API URL / auth fixes.
# Run on VPS: bash FIX_SALON_PANEL_ON_VPS.sh

set -e

echo "=========================================="
echo "Fix salon panel — rebuild & deploy"
echo "=========================================="

BACKEND_ENV="/home/admin/backend/.env"
if [ -f "$BACKEND_ENV" ]; then
  SECRET_KEY=$(grep -E "^secretKey\s*=" "$BACKEND_ENV" | sed 's/^secretKey\s*=\s*//')
fi
SECRET_KEY="${SECRET_KEY:-}"

if [ -z "$SECRET_KEY" ] && [ -f "/home/admin/backend/config.js" ]; then
  SECRET_KEY=$(grep "secretKey" /home/admin/backend/config.js | sed 's/.*= "\(.*\)";/\1/' 2>/dev/null || true)
fi

DOMAIN="${APP_DOMAIN:-skedisy.com}"
API_BASE="https://${DOMAIN}/"

cd /home/admin/salon || exit 1
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc 2>/dev/null || true
nvm use 18.20.2 2>/dev/null || true

npm install
PUBLIC_URL=/salonpanel npm run build

if [ ! -f "build/index.html" ]; then
  echo "❌ Build failed"
  exit 1
fi

# Inject runtime config so API key works without baking into webpack
node -e "
const fs = require('fs');
const cfg = { apiBase: process.env.API_BASE, apiKey: process.env.SECRET_KEY };
fs.writeFileSync(
  'build/runtime-config.js',
  'window.__SKEDISY_SALON__=' + JSON.stringify(cfg) + ';'
);
" API_BASE="$API_BASE" SECRET_KEY="$SECRET_KEY"

sudo rm -rf /home/admin/backend/salon
sudo mkdir -p /home/admin/backend/salon
sudo cp -r build/* /home/admin/backend/salon/

# Sync backend fixes (runtime-config route, login apiKey, middleware)
if [ -d "/home/admin/backend" ]; then
  cd /home/admin/backend || true
  git pull 2>/dev/null || echo "⚠️  git pull skipped — deploy backend/index.js manually if needed"
fi

pm2 restart backend

echo "✅ Salon panel deployed."
echo "   Open: https://${DOMAIN}/salonpanel"
echo "   Check Network: GET https://${DOMAIN}/salon/dashboard/allStats (headers: key, Authorization)"
echo "   runtime-config: https://${DOMAIN}/salonpanel/runtime-config.js"
