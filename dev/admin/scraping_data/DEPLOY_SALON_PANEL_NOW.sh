#!/bin/bash
# Déploiement complet salon panel — à exécuter SUR LE VPS (root ou admin)
# Usage: cd /home/admin/slotify2 && bash dev/admin/scraping_data/DEPLOY_SALON_PANEL_NOW.sh

set -e

DOMAIN="${APP_DOMAIN:-skedisy.com}"
REPO_URL="${REPO_URL:-https://github.com/willybrondon/slotify2.git}"
REPO_DIR="${REPO_DIR:-/home/admin/slotify2}"
SALON_SRC="/home/admin/salon"
BACKEND_DIR="/home/admin/backend"
API_BASE="https://${DOMAIN}/"

fix_ownership() {
  local target="$1"
  if id admin &>/dev/null; then
    chown -R admin:admin "$target" 2>/dev/null || sudo chown -R admin:admin "$target"
  else
    echo "   (pas d'utilisateur admin — chown ignoré, fichiers laissés à $(stat -c '%U' "$target" 2>/dev/null || echo root))"
  fi
}

echo "=========================================="
echo " Déploiement salon panel — ${DOMAIN}"
echo "=========================================="

# --- 1. Récupérer le code (monorepo) ---
if [ -d "$REPO_DIR/.git" ]; then
  echo "→ git pull dans $REPO_DIR"
  cd "$REPO_DIR" && git pull origin main
else
  echo "→ clone $REPO_URL"
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
fi

# --- 2. Synchroniser les sources (sans écraser .env) ---
echo "→ Sync salon frontend"
mkdir -p "$SALON_SRC"
rsync -a --delete \
  "$REPO_DIR/dev/admin/salon/" "$SALON_SRC/" \
  --exclude node_modules --exclude build

echo "→ Sync backend (hors .env)"
rsync -a \
  "$REPO_DIR/dev/admin/backend/" "$BACKEND_DIR/" \
  --exclude node_modules --exclude .env

# --- 3. Clé API depuis .env backend ---
SECRET_KEY=""
if [ -f "$BACKEND_DIR/.env" ]; then
  SECRET_KEY=$(grep -E "^secretKey\s*=" "$BACKEND_DIR/.env" | sed 's/^secretKey\s*=\s*//' | tr -d '\r')
fi
echo "   secretKey length: ${#SECRET_KEY}"
if [ -z "$SECRET_KEY" ]; then
  echo "⚠️  secretKey vide dans $BACKEND_DIR/.env — les appels API échoueront"
fi

# --- 4. Build React salon panel ---
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin:$HOME/.nvm/versions/node/v18.20.2/bin"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
nvm use 18.20.2 2>/dev/null || true

cd "$SALON_SRC"
npm install
PUBLIC_URL=/salonpanel npm run build

if [ ! -f "build/index.html" ]; then
  echo "❌ Build échoué"
  exit 1
fi

# --- 5. runtime-config.js (clé API injectée à l'exécution) ---
node -e "
const fs = require('fs');
const cfg = { apiBase: process.env.API_BASE, apiKey: process.env.SECRET_KEY };
fs.writeFileSync(
  'build/runtime-config.js',
  'window.__SKEDISY_SALON__=' + JSON.stringify(cfg) + ';'
);
" API_BASE="$API_BASE" SECRET_KEY="$SECRET_KEY"

# --- 6. Déployer le build ---
rm -rf "$BACKEND_DIR/salon"
mkdir -p "$BACKEND_DIR/salon"
cp -r build/* "$BACKEND_DIR/salon/"
fix_ownership "$BACKEND_DIR/salon"

echo "✅ Build déployé dans $BACKEND_DIR/salon"

# --- 7. Nginx — proxy runtime-config vers Node (évite index.html) ---
NGINX_CONF=""
for f in /etc/nginx/sites-available/skedisy.com /etc/nginx/sites-available/skedisy /etc/nginx/sites-enabled/skedisy.com; do
  [ -f "$f" ] && NGINX_CONF="$f" && break
done

if [ -n "$NGINX_CONF" ]; then
  if ! grep -q "location = /salonpanel/runtime-config.js" "$NGINX_CONF"; then
    echo "→ Ajout bloc nginx runtime-config dans $NGINX_CONF"
    sudo cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%s)"
    sudo sed -i '/location \^~ \/salonpanel\//i\
    location = /salonpanel/runtime-config.js {\
        proxy_pass http://localhost:5000;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
    }\
' "$NGINX_CONF"
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx rechargé"
  else
    echo "✓ Nginx runtime-config déjà configuré"
  fi
else
  echo "⚠️  Config nginx introuvable — ajoutez manuellement le proxy runtime-config"
fi

# --- 8. Redémarrer backend ---
cd "$BACKEND_DIR"
npm install --omit=dev 2>/dev/null || npm install
pm2 restart backend 2>/dev/null || pm2 start index.js --name backend
pm2 save 2>/dev/null || true

# --- 9. Tests ---
echo ""
echo "=== Vérifications ==="
echo -n "runtime-config (fichier statique): "
curl -sf "https://${DOMAIN}/salonpanel/runtime-config.js" | head -c 80 || echo "FAIL"
echo ""
echo -n "runtime-config (via Node :5000): "
curl -sf "http://localhost:5000/salonpanel/runtime-config.js" | head -c 80 || echo "FAIL"
echo ""
echo -n "API salon (sans auth → 403 JSON attendu): "
curl -sf "http://localhost:5000/salon/dashboard/allStats?startDate=ALL&endDate=ALL" || true
echo ""
echo ""
echo "=========================================="
echo " Terminé. Testez: https://${DOMAIN}/salonpanel"
echo " Après login, Network → GET /salon/dashboard/allStats"
echo "=========================================="
