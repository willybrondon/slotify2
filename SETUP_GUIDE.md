# Slotify CI/CD Setup Guide

This guide explains how to configure the CI/CD pipeline for deploying the Slotify platform to both App Store and Play Store.

## Overview

The CI/CD pipeline is structured as follows:
- **Admin Panel**: Deployed to DigitalOcean Ubuntu server
- **Android Apps**: Built on Ubuntu, signed, and deployed to Google Play Store
- **iOS Apps**: Built on macOS, signed, and deployed to App Store Connect

## Required GitHub Secrets

### DigitalOcean Deployment
```bash
DIGITALOCEAN_ACCESS_TOKEN=your_digitalocean_api_token
SSH_PRIVATE_KEY=your_ssh_private_key_for_droplet
JWT_SECRET=your_jwt_secret_key
SECRET_KEY=your_api_secret_key
```

### Android Play Store Deployment
```bash
PLAY_STORE_CREDENTIALS={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
KEYSTORE_PASSWORD=your_keystore_password
```

### iOS App Store Deployment
```bash
IOS_P12_CERTIFICATE=base64_encoded_p12_certificate
IOS_P12_PASSWORD=your_p12_certificate_password
APPSTORE_ISSUER_ID=your_appstore_issuer_id
APPSTORE_API_KEY_ID=your_appstore_api_key_id
APPSTORE_API_PRIVATE_KEY=your_appstore_api_private_key
```

## Platform-Specific Setup

### 1. Android Play Store Setup

#### Step 1: Create Google Play Console Account
1. Visit [Google Play Console](https://play.google.com/console)
2. Create a new account or use existing one
3. Pay the one-time $25 registration fee

#### Step 2: Create Service Account
1. Go to Google Cloud Console
2. Create a new project or select existing one
3. Enable Google Play Android Developer API
4. Create a Service Account
5. Download the JSON credentials file
6. Add the JSON content to `PLAY_STORE_CREDENTIALS` secret

#### Step 3: Configure Play Console
1. In Play Console, go to Setup → API access
2. Link your Google Cloud project
3. Grant access to your Service Account
4. Set up app signing (recommended)

#### Step 4: Create Apps in Play Console
1. Create two apps:
   - **Customer App**: `com.slotify.customer`
   - **Expert App**: `com.slotify.expert`
2. Fill in app details, screenshots, descriptions
3. Set up content rating and privacy policy

### 2. iOS App Store Setup

#### Step 1: Apple Developer Account
1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Access App Store Connect

#### Step 2: Create App Store Connect API Key
1. Go to App Store Connect → Users and Access → Keys
2. Create a new API key with App Manager role
3. Note down:
   - Issuer ID
   - Key ID
   - Download the private key file

#### Step 3: Create Distribution Certificate
1. In Apple Developer portal, go to Certificates
2. Create a new iOS Distribution certificate
3. Download the certificate and convert to P12 format
4. Base64 encode the P12 file:
   ```bash
   base64 -i your_certificate.p12 | tr -d '\n'
   ```

#### Step 4: Create Provisioning Profiles
1. In Apple Developer portal, create App Store provisioning profiles
2. Bundle IDs should match:
   - `com.slotify.customer`
   - `com.slotify.expert`

#### Step 5: Create Apps in App Store Connect
1. Create two apps in App Store Connect
2. Configure app information, screenshots, descriptions
3. Set up app review information

### 3. DigitalOcean Setup

#### Step 1: Create Droplet
1. Create Ubuntu 22.04 droplet
2. Configure SSH key access
3. Note the IP address: `46.101.229.176`

#### Step 2: Generate SSH Key Pair
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

#### Step 3: Add SSH Key to Droplet
```bash
ssh-copy-id root@46.101.229.176
```

## Configuration Files

### 1. Update iOS Export Options
Edit `slotify/flutter/multi_salon_customer/ios/exportOptions.plist` and `slotify/flutter/multi_salon_expert/ios/exportOptions.plist`:
```xml
<key>teamID</key>
<string>YOUR_ACTUAL_TEAM_ID</string>
```

### 2. Update Android Package Names
In each Flutter app's `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.slotify.customer" // or com.slotify.expert
    }
}
```

### 3. Update iOS Bundle Identifiers
In each Flutter app's `ios/Runner.xcodeproj/project.pbxproj`:
```
PRODUCT_BUNDLE_IDENTIFIER = com.slotify.customer; // or com.slotify.expert
```

## Pipeline Workflow

### Development Branch (`develop`)
- Runs tests and builds
- Deploys admin panel to development environment
- Builds Flutter apps for testing

### Main Branch (`main`)
- Runs all tests and builds
- Deploys admin panel to DigitalOcean production
- Builds and signs Android apps for Play Store
- Builds and signs iOS apps for App Store
- Uploads to respective stores

## Testing the Pipeline

### 1. Test Development Deployment
```bash
git checkout develop
git push origin develop
```

### 2. Test Production Deployment
```bash
git checkout main
git push origin main
```

### 3. Monitor Pipeline
1. Go to GitHub repository → Actions
2. Monitor the workflow execution
3. Check for any failures and fix issues

## Troubleshooting

### Common Issues

#### Android Build Failures
- **Signing issues**: Check `KEYSTORE_PASSWORD` secret
- **Play Store upload failures**: Verify `PLAY_STORE_CREDENTIALS` format
- **Package name conflicts**: Ensure unique package names

#### iOS Build Failures
- **Certificate issues**: Verify P12 certificate and password
- **Provisioning profile issues**: Check bundle ID matches
- **Code signing issues**: Verify team ID in exportOptions.plist

#### Admin Panel Deployment Failures
- **SSH connection issues**: Check SSH key and droplet access
- **Environment variable issues**: Verify all secrets are set
- **Port access issues**: Ensure port 5000 is open on droplet

### Debugging Steps
1. Check GitHub Actions logs for detailed error messages
2. Verify all secrets are properly configured
3. Test manual deployment to isolate issues
4. Check platform-specific requirements (Play Console, App Store Connect)

## Security Considerations

1. **Secrets Management**: Never commit secrets to repository
2. **Certificate Security**: Keep certificates secure and rotate regularly
3. **Access Control**: Limit access to deployment credentials
4. **Audit Logs**: Monitor deployment logs for suspicious activity

## Cost Considerations

- **Apple Developer Program**: $99/year
- **Google Play Console**: $25 one-time
- **DigitalOcean Droplet**: ~$24/month (2GB RAM)
- **GitHub Actions**: Free for public repos, paid for private

## Support

For issues with:
- **CI/CD Pipeline**: Check GitHub Actions documentation
- **Play Store**: Contact Google Play Console support
- **App Store**: Contact Apple Developer support
- **DigitalOcean**: Contact DigitalOcean support 