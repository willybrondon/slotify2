#!/bin/bash

# Slotify Admin Panel Deployment Script for DigitalOcean
# This script deploys the admin panel to DigitalOcean Droplet

set -e

# Configuration
DROPLET_IP="46.101.229.176"
DROPLET_NAME="ubuntu-s-2vcpu-4gb-120gb-intel-fra1-01"
PROJECT_NAME="first-project"
SSH_USER="root"
SSH_KEY_PATH="~/.ssh/id_rsa"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check SSH connection
check_ssh_connection() {
    print_status "Checking SSH connection to DigitalOcean droplet..."
    
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes -i "$SSH_KEY_PATH" "$SSH_USER@$DROPLET_IP" exit 2>/dev/null; then
        print_error "Cannot connect to DigitalOcean droplet via SSH"
        print_error "Please check:"
        print_error "1. SSH key is properly configured"
        print_error "2. Droplet IP address is correct: $DROPLET_IP"
        print_error "3. Firewall allows SSH connections"
        exit 1
    fi
    
    print_success "SSH connection established"
}

# Function to copy admin folder and install.sh to server
copy_admin_to_server() {
    print_status "Copying admin folder and install.sh to DigitalOcean server..."
    
    # Create a temporary directory for the deployment
    TEMP_DIR=$(mktemp -d)
    
    # Copy admin folder and install.sh to temp directory
    cp -r admin-deploy/admin "$TEMP_DIR/"
    cp admin-deploy/install.sh "$TEMP_DIR/"
    
    # Copy to server
    if scp -i "$SSH_KEY_PATH" -r "$TEMP_DIR"/* "$SSH_USER@$DROPLET_IP:/home/"; then
        print_success "Admin folder and install.sh copied to server"
    else
        print_error "Failed to copy files to server"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    # Clean up temp directory
    rm -rf "$TEMP_DIR"
}

# Function to run installation on server
run_installation_on_server() {
    print_status "Running installation commands on DigitalOcean server..."
    
    # SSH into the server and run installation commands
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$DROPLET_IP" << 'EOF'
        set -e
        
        echo "Starting installation process..."
        
        # Navigate to home directory where files were copied
        cd /home
        
        # Convert line endings and make install.sh executable
        if command -v dos2unix >/dev/null 2>&1; then
            dos2unix install.sh
        fi
        chmod +x install.sh
        
        # Run the installation script
        echo "Running install.sh..."
        ./install.sh
        
        echo "Installation completed successfully!"
EOF
    
    if [ $? -eq 0 ]; then
        print_success "Installation completed on server"
    else
        print_error "Installation failed on server"
        exit 1
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Wait a moment for services to start
    sleep 10
    
    # Check if admin panel is accessible
    if curl -f -s "http://$DROPLET_IP:5000/" > /dev/null; then
        print_success "Admin panel is accessible at http://$DROPLET_IP:5000/"
    else
        print_warning "Admin panel might not be accessible yet"
    fi
    
    # Check if salon panel is accessible
    if curl -f -s "http://$DROPLET_IP:5000/salonpanel" > /dev/null; then
        print_success "Salon panel is accessible at http://$DROPLET_IP:5000/salonpanel"
    else
        print_warning "Salon panel might not be accessible yet"
    fi
    
    # Check if processes are running
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$DROPLET_IP" << 'EOF'
        echo "Checking running processes..."
        if pgrep -f "node.*index.js" > /dev/null; then
            echo "✅ Node.js processes are running"
        else
            echo "❌ Node.js processes are not running"
            exit 1
        fi
        
        if pgrep -f "mongod" > /dev/null; then
            echo "✅ MongoDB is running"
        else
            echo "❌ MongoDB is not running"
            exit 1
        fi
EOF
}

# Function to display deployment summary
display_summary() {
    print_success "Deployment completed successfully!"
    echo
    echo "=== Deployment Summary ==="
    echo "Server: $DROPLET_IP"
    echo "Admin Panel: http://$DROPLET_IP:5000/"
    echo "Salon Panel: http://$DROPLET_IP:5000/salonpanel"
    echo
    echo "=== Access Information ==="
    echo "Admin Login:"
    echo "  Email: admin@slotify.com"
    echo "  Password: admin123"
    echo
    echo "Salon Login:"
    echo "  Email: salon@slotify.com"
    echo "  Password: salon123"
    echo
    echo "=== Next Steps ==="
    echo "1. Access the admin panel and change default passwords"
    echo "2. Configure your domain name to point to $DROPLET_IP"
    echo "3. Set up SSL certificates for HTTPS"
    echo "4. Configure backup and monitoring"
}

# Main deployment function
main() {
    print_status "Starting Slotify Admin Panel deployment to DigitalOcean..."
    print_status "Target server: $DROPLET_IP"
    
    # Check prerequisites
    if ! command_exists ssh; then
        print_error "SSH client is not installed"
        exit 1
    fi
    
    if ! command_exists scp; then
        print_error "SCP client is not installed"
        exit 1
    fi
    
    if ! command_exists curl; then
        print_error "cURL is not installed"
        exit 1
    fi
    
    # Check if admin-deploy directory exists
    if [ ! -d "admin-deploy" ]; then
        print_error "admin-deploy directory not found"
        print_error "Make sure the CI/CD pipeline has downloaded the admin artifacts"
        exit 1
    fi
    
    # Check if install.sh exists
    if [ ! -f "admin-deploy/install.sh" ]; then
        print_error "install.sh not found in admin-deploy directory"
        exit 1
    fi
    
    # Execute deployment steps
    check_ssh_connection
    copy_admin_to_server
    run_installation_on_server
    verify_deployment
    display_summary
    
    print_success "Deployment completed successfully!"
}

# Run main function
main "$@" 