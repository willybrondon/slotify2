#!/bin/bash

# Update and clear screen
sudo apt update && clear

# Use PUBLIC_IP from environment if set, otherwise prompt the user
if [ -n "$PUBLIC_IP" ]; then
    public_ip="$PUBLIC_IP"
    echo "Using PUBLIC_IP from environment: $public_ip"
else
    get_public_ip=$(wget -T 10 -t 1 -4qO- "http://ip1.dynupdate.no-ip.com/" || curl -m 10 -4Ls "http://ip1.dynupdate.no-ip.com/" | grep -m 1 -oE '^[0-9]{1,3}(\.[0-9]{1,3}){3}$')
    read -p "Public IPv4 address / hostname [$get_public_ip]: " public_ip
    until [[ -n "$get_public_ip" || -n "$public_ip" ]]; do
        echo "Invalid input."
        read -p "Public IPv4 address / hostname: " public_ip
    done
    [[ -z "$public_ip" ]] && public_ip="$get_public_ip"
fi
echo "PUBLIC_IP: $PUBLIC_IP"

# Update and clear screen
sudo apt update
sudo apt upgrade -y
clear

# Install Node.js
echo "
################################################
#                INSTALL NODEJS                #
################################################
"
sudo apt install curl -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install v18.20.2
node -v

# Install Nginx
echo "
################################################
#                INSTALL NGINX                 #
################################################
"
sudo apt install -y nginx
sudo systemctl status nginx
clear

# Install PM2
echo "
################################################
#                INSTALL PM2                   #
################################################
"
sudo apt install npm -y
npm install pm2 -g
clear

# Set up application configuration
# Use SECRET_KEY from environment if set, otherwise prompt the user
if [ -n "$SECRET_KEY" ]; then
    shared_secret_key="$SECRET_KEY"
    echo "Using SECRET_KEY from environment: $shared_secret_key"
else
    get_shared_secret_key="5TIvw5cpc0"
    read -p "Shared Secret key [5TIvw5cpc0]: " shared_secret_key
    [[ -z "$shared_secret_key" ]] && shared_secret_key="$get_shared_secret_key"
fi
  
echo "SECRET_KEY: $SECRET_KEY"  

# Use DB_NAME from environment if set, otherwise prompt the user
if [ -n "$DB_NAME" ]; then
    app_name="$DB_NAME"
    echo "Using DB_NAME from environment as app_name: $app_name"
else
    read -p "Your app name: " app_name
fi

echo "DB_NAME: $DB_NAME"

if [ -n "$JWT_SECRET" ]; then
    shared_jwt_secret="$JWT_SECRET"
    echo "the jwt_secret from environment is: $shared_jwt_secret"
else
    get_shared_jwt_secret="2FhKmINItB"
    read -p "Shared Jwt Secret [2FhKmINItB]: " shared_jwt_secret
    [[ -z "$shared_jwt_secret" ]] && shared_jwt_secret="$get_shared_jwt_secret"
fi


# Install MongoDB
echo "
################################################
#                INSTALL MONGODB               #
################################################
"
sudo apt install software-properties-common gnupg apt-transport-https ca-certificates -y
curl -fsSL https://pgp.mongodb.com/server-7.0.asc |  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install mongodb-org -y
mongod --version
sudo systemctl start mongod
sudo ss -pnltu | grep 27017
sudo systemctl enable mongod

# Wait for MongoDB to start
sleep 10

# Mongodb User Name
mongodbUser_name=$(echo "$app_name" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
echo "Your mongodb user name formatted: $mongodbUser_name"

# Create admin user
mongosh <<EOF
use $mongodbUser_name
db.createUser({user:"admin", pwd:"dbadmin123", roles: [{ role: "userAdminAnyDatabase", db: "admin" }, { role: "readWrite", db: "$mongodbUser_name" }]})
exit
EOF

# Enable authentication in MongoDB
# sudo sed -i '/#security:/a\security:\n  authorization: enabled' /etc/mongod.conf
# sudo sed -i "s/bindIp: 127.0.0.1/bindIp: 127.0.0.1,$public_ip/" /etc/mongod.conf
sudo systemctl restart mongod

# Install backend dependencies
echo "
################################################
#                INSTALL BACKEND               #
################################################
"
cd /home/admin/backend || exit
npm install
# npm install nodemailer
npm install @sendgrid/mail
cat > .env << EOF
#Port
PORT = 5000

#Project Name
projectName = ${app_name}

#Secret key for jwt
JWT_SECRET = ${shared_jwt_secret}

#Gmail credentials for send email
# EMAIL = $EMAIL
# PASSWORD = $PASSWORD

#Sendgrid credentials for send email
SENDGRID_API_KEY = $SENDGRID_API_KEY
EMAIL = $EMAIL
# no need to use password for sendgrid
PASSWORD = $PASSWORD

#Server URL
baseURL = http://${public_ip}:5000/

#Secret key for API
secretKey = ${shared_secret_key}

#Mongodb string
MONGODB_CONNECTION_STRING = mongodb://admin:dbadmin123@${public_ip}:27017/${mongodbUser_name}
EOF
cd /home/admin/backend || exit
pm2 start index.js --name backend
pm2 status
node -v
pm2 restart backend --interpreter $(which node)

# Install frontend dependencies and build
echo "
################################################
#                INSTALL FRONTEND              #
################################################
"
cd /home/admin/frontend/src/util || exit
cat > config.js << EOF
export const baseURL = "http://$public_ip:5000/";
export const secretKey = "$shared_secret_key";
export const projectName = "$app_name";
EOF
echo $PATH
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc
nvm install node
npm install --f
echo $PATH
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc
nvm install node
npm run build
sudo rm -rf /home/admin/backend/public
mkdir -p /home/admin/backend/public
sudo mv /home/admin/frontend/build/* /home/admin/backend/public

# Install salon dependencies and build
echo "
################################################
#                INSTALL SALON              #
################################################
"
cd /home/admin/salon/src/util || exit
cat > config.js << EOF
export const baseURL = "http://$public_ip:5000/";
export const secretKey = "$shared_secret_key";
export const projectName = "$app_name";
EOF
echo $PATH
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc
nvm install node
npm install --f
echo $PATH
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc
nvm install node
npm run build
sudo rm -rf /home/admin/backend/salon
mkdir -p /home/admin/backend/salon
sudo mv /home/admin/salon/build/* /home/admin/backend/salon


# Deploy salonportal static files
echo "
################################################
#                DEPLOY SALONPORTAL            #
################################################
"
sudo rm -rf /home/admin/backend/salonportal
mkdir -p /home/admin/backend/salonportal
sudo cp /home/admin/salonportal/* /home/admin/backend/salonportal


# Configure Nginx
echo "
################################################
#                CONFIGURE NGINX               #
################################################
"
sudo cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80;
    listen [::]:80;
    client_max_body_size 300M;
    access_log /var/log/nginx/$app_name.access.log;  #whatever your server name
    error_log /var/log/nginx/$app_name.error.log;   #whatever your server name
    root /path;
    location / {
        proxy_pass http://localhost:5000;   #whatever port your app runs on
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;

        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forward-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forward-Proto http;
        proxy_set_header X-Nginx-Proxy true;     
    }
}
EOF
sudo systemctl restart nginx
clear

echo $PATH
export PATH="$PATH:/root/.nvm/versions/node/v18.20.2/bin"
source ~/.bashrc
nvm install node
node -v
pm2 restart backend --interpreter $(which node)

echo "
################################################
#                CONGRATULATIONS!              #
################################################
Server setup is complete.
1. baseURL : http://$public_ip:5000/
3. SalonPanel : http://$public_ip:5000/salonpanel
2. Secret key : $shared_secret_key
3. MONGODB_CONNECTION_STRING: "mongodb://admin:dbadmin123@$public_ip:27017/$mongodbUser_name"
"