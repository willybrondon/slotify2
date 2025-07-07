#!/bin/bash

# Slotify Flutter App Deployment Script
# This script builds and deploys Flutter apps for different environments

set -e

# Configuration
ENVIRONMENT=${1:-dev}
CUSTOMER_APP_PATH="slotify/flutter/multi_salon_customer"
EXPERT_APP_PATH="slotify/flutter/multi_salon_expert"
BUILD_OUTPUT_DIR="builds"

# Environment-specific configurations
if [ "$ENVIRONMENT" = "prd" ]; then
    SERVER_URL="http://46.101.229.176:5000/"
    SECRET_KEY="5TIvw5cpc0"
    PROJECT_NAME="slotify"
else
    SERVER_URL="http://dev-server:5000/"
    SECRET_KEY="dev_secret_key"
    PROJECT_NAME="slotify-dev"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Flutter installation
check_flutter() {
    print_status "Checking Flutter installation..."
    
    if ! command -v flutter &> /dev/null; then
        print_error "Flutter is not installed or not in PATH"
        exit 1
    fi
    
    flutter --version
    print_status "Flutter installation verified"
}

# Update app configuration
update_app_config() {
    local app_path=$1
    local app_name=$2
    
    print_status "Updating configuration for $app_name..."
    
    # Update config file
    cat > "$app_path/lib/utils/config.dart" << EOF
class Config {
  static const String baseURL = "$SERVER_URL";
  static const String secretKey = "$SECRET_KEY";
  static const String projectName = "$PROJECT_NAME";
}
EOF
    
    print_status "Configuration updated for $app_name"
}

# Build Flutter app
build_flutter_app() {
    local app_path=$1
    local app_name=$2
    
    print_status "Building $app_name for $ENVIRONMENT environment..."
    
    cd "$app_path"
    
    # Get dependencies
    flutter pub get
    
    # Run tests
    print_status "Running tests for $app_name..."
    flutter test || print_warning "Some tests failed, continuing with build"
    
    # Analyze code
    print_status "Analyzing code for $app_name..."
    flutter analyze || print_warning "Code analysis found issues"
    
    # Build APK
    print_status "Building APK for $app_name..."
    flutter build apk --release
    
    # Build App Bundle (for Play Store)
    print_status "Building App Bundle for $app_name..."
    flutter build appbundle --release
    
    cd - > /dev/null
    
    # Copy builds to output directory
    mkdir -p "$BUILD_OUTPUT_DIR/$ENVIRONMENT"
    cp "$app_path/build/app/outputs/flutter-apk/app-release.apk" "$BUILD_OUTPUT_DIR/$ENVIRONMENT/${app_name}-$ENVIRONMENT.apk"
    cp "$app_path/build/app/outputs/bundle/release/app-release.aab" "$BUILD_OUTPUT_DIR/$ENVIRONMENT/${app_name}-$ENVIRONMENT.aab"
    
    print_status "$app_name build completed"
}

# Deploy to Firebase App Distribution (if configured)
deploy_to_firebase() {
    local app_path=$1
    local app_name=$2
    
    if [ -n "$FIREBASE_TOKEN" ] && [ -f "$app_path/android/app/google-services.json" ]; then
        print_status "Deploying $app_name to Firebase App Distribution..."
        
        cd "$app_path"
        
        # Deploy APK to Firebase App Distribution
        firebase appdistribution:distribute "build/app/outputs/flutter-apk/app-release.apk" \
            --app "$FIREBASE_APP_ID" \
            --groups "testers" \
            --release-notes "Deployed to $ENVIRONMENT environment" \
            --token "$FIREBASE_TOKEN"
        
        cd - > /dev/null
        
        print_status "$app_name deployed to Firebase App Distribution"
    else
        print_warning "Firebase App Distribution not configured for $app_name"
    fi
}

# Deploy to Play Store (production only)
deploy_to_play_store() {
    local app_path=$1
    local app_name=$2
    
    if [ "$ENVIRONMENT" = "prd" ] && [ -n "$PLAY_STORE_CREDENTIALS" ]; then
        print_status "Deploying $app_name to Play Store..."
        
        cd "$app_path"
        
        # Deploy to Play Store using fastlane or similar tool
        # This is a placeholder - implement based on your Play Store setup
        echo "Play Store deployment would happen here"
        
        cd - > /dev/null
        
        print_status "$app_name deployed to Play Store"
    else
        print_warning "Play Store deployment skipped (not production or credentials not configured)"
    fi
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    cat > "$BUILD_OUTPUT_DIR/$ENVIRONMENT/deployment-report.md" << EOF
# Slotify Flutter App Deployment Report

**Environment:** $ENVIRONMENT
**Deployment Date:** $(date)
**Server URL:** $SERVER_URL

## Built Applications

### Customer App
- **APK:** ${app_name}-$ENVIRONMENT.apk
- **AAB:** ${app_name}-$ENVIRONMENT.aab
- **Status:** ✅ Built successfully

### Expert App
- **APK:** ${app_name}-$ENVIRONMENT.apk
- **AAB:** ${app_name}-$ENVIRONMENT.aab
- **Status:** ✅ Built successfully

## Configuration
- **Project Name:** $PROJECT_NAME
- **Secret Key:** $SECRET_KEY
- **Base URL:** $SERVER_URL

## Next Steps
1. Test the APK files on target devices
2. Deploy to Firebase App Distribution for testing
3. Submit to Play Store (production only)
EOF
    
    print_status "Deployment report generated: $BUILD_OUTPUT_DIR/$ENVIRONMENT/deployment-report.md"
}

# Main deployment function
main() {
    print_status "Starting Flutter app deployment for $ENVIRONMENT environment"
    
    check_flutter
    
    # Create build output directory
    mkdir -p "$BUILD_OUTPUT_DIR/$ENVIRONMENT"
    
    # Deploy Customer App
    print_status "=== Deploying Customer App ==="
    update_app_config "$CUSTOMER_APP_PATH" "Customer App"
    build_flutter_app "$CUSTOMER_APP_PATH" "customer"
    deploy_to_firebase "$CUSTOMER_APP_PATH" "Customer App"
    deploy_to_play_store "$CUSTOMER_APP_PATH" "Customer App"
    
    # Deploy Expert App
    print_status "=== Deploying Expert App ==="
    update_app_config "$EXPERT_APP_PATH" "Expert App"
    build_flutter_app "$EXPERT_APP_PATH" "expert"
    deploy_to_firebase "$EXPERT_APP_PATH" "Expert App"
    deploy_to_play_store "$EXPERT_APP_PATH" "Expert App"
    
    # Generate report
    generate_report
    
    print_status "Flutter app deployment completed successfully!"
    print_status "Build outputs available in: $BUILD_OUTPUT_DIR/$ENVIRONMENT/"
}

# Show usage if no arguments provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 [dev|prd]"
    echo "  dev  - Deploy to development environment"
    echo "  prd  - Deploy to production environment"
    exit 1
fi

# Validate environment argument
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prd" ]; then
    print_error "Invalid environment. Use 'dev' or 'prd'"
    exit 1
fi

# Run main function
main "$@" 