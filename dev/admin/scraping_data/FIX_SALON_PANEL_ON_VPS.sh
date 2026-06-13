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

cd /home/admin/salon/src/util || exit 1
cat > config.js << EOF
function resolveBaseURL() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return \`\${window.location.origin}/\`;
  }
  return "https://${DOMAIN}/";
}
export const baseURL = resolveBaseURL();
export const secretKey = "${SECRET_KEY}";
export const projectName = "Skedisy";
EOF

echo "✅ config.js updated (secretKey length: ${#SECRET_KEY})"

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

sudo rm -rf /home/admin/backend/salon
sudo mkdir -p /home/admin/backend/salon
sudo cp -r build/* /home/admin/backend/salon/

pm2 restart backend

echo "✅ Salon panel deployed. Test: https://${DOMAIN}/salonpanel"
echo "   Network tab should show: GET https://${DOMAIN}/salon/dashboard/allStats"
