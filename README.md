# Slotify Platform 

## Overview
Slotify is a comprehensive salon management platform that includes an admin panel and mobile applications for customers and salon experts. This guide provides detailed installation instructions for both the admin panel and Flutter mobile applications.

## General Architecture

The Slotify platform is organized as follows:

```
[admin]
│
├── backend/         # Node.js/Express API, MongoDB, business logic
│
├── frontend/        # Main web frontend (React or similar)
│
├── salon/           # Salon admin/owner panel (React or similar)
│
├── salonportal/     # Static landing/marketing site for demo requests
│
[flutter]
│
├── multi_salon_expert/    # Flutter app for salon staff/experts
│
├── multi_salon_customer/  # Flutter app for salon customers/clients
│
[install.sh]
│
└── Automates setup, build, deployment, and Nginx config
```

- **Backend** serves API endpoints, handles authentication, business logic, and serves static files for frontend, salon, and salonportal.
- **Frontend** and **salon** are built and their static files are served by the backend (and proxied by Nginx).
- **salonportal** is a static site for marketing and demo requests, also served by the backend.
- **Flutter apps** are for mobile users (experts and customers), communicating with the backend API.
- **Nginx** acts as a reverse proxy, forwarding HTTP requests to the backend and serving static files.

---

## Environment 
- **DEV** - Development environment
- **PRD** - Production environment

## Required Software

### For Admin Panel Installation:
- **Ubuntu 22.04** (Server OS)
- **Node.js v18.20.2** (Backend runtime)
- **Nginx** (Web server)
- **MongoDB 7.0** (Database)
- **PM2** (Process manager)
- **WinSCP** (File transfer for Windows)
- **PuTTY** (SSH client for Windows)
- **MongoDB Compass** (Database management tool)

### For Flutter App Development:
- **Flutter SDK 3.16.8** (Mobile app framework)
- **Dart SDK** (Programming language)
- **Android Studio** (IDE for Android development)
- **Xcode** (For iOS development on macOS)
- **Firebase Console** (Backend services)
- **Git** (Version control)

---

## Admin Panel Installation

### Step 1: Server Setup (DigitalOcean)

1. **Create DigitalOcean Account**
   - Visit [DigitalOcean](https://www.digitalocean.com/?refcode=7370b478e2d7&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=CopyPaste)
   - Sign up and receive $200 in credits for 2 months

2. **Create Droplet**
   - Click "Create" button in top right corner
   - Choose your preferred region
   - Select **Ubuntu 22.04** as the operating system
   - Choose appropriate size (minimum 1GB RAM recommended)
   - Enable backups (optional)
   - Choose authentication method (SSH key recommended)
   - Finalize details and create droplet

3. **Get Server IP**
   - Note the IP address displayed after droplet creation
   - This will be your server's public IP address

### Step 2: Connect to Server

1. **Using WinSCP (File Transfer)**
   - Download and install WinSCP
   - Connect using your server IP, username (root), and password/SSH key
   - Navigate to `/home` directory

2. **Using PuTTY (Command Line)**
   - Download and install PuTTY
   - Connect to your server IP using SSH
   - Login with root credentials

### Step 3: Upload and Extract Project

1. **Upload Admin Files**
   - Transfer the `admin.zip` file to `/home` directory using WinSCP

2. **Install Unzip and Extract**
   ```bash
   apt install unzip
   cd /home
   unzip admin.zip -d /home
   clear
   ```

### Step 4: Server Installation Script

1. **Create Install Script**
   - Navigate to root directory: `cd /`
   - Create `install.sh` file using WinSCP
   - Copy the provided `install.sh` content into the file

2. **Run Installation**
   ```bash
   sudo apt install dos2unix
   chmod +x install.sh
   ./install.sh
   ```

3. **Follow Installation Prompts**
   - Enter your server's public IP address
   - Set your app name
   - Use default or custom secret keys
   - Wait for installation to complete

### Step 5: Database Setup

1. **Download MongoDB Compass**
   - Visit [MongoDB Compass Download](https://www.mongodb.com/try/download/compass)
   - Install on your local machine

2. **Connect to Database**
   - Open MongoDB Compass
   - Use the connection string provided after installation:
     ```
     mongodb://admin:dbadmin123@YOUR_SERVER_IP:27017/YOUR_APP_NAME
     ```

3. **Import Data**
   - Navigate to your database
   - Import the `settings` collection from the `DB` folder
   - Select "Import JSON or CSV File"
   - Choose the JSON files and import

### Step 6: Access Admin Panel

- **Admin Panel**: `http://YOUR_SERVER_IP:5000/`
- **Salon Panel**: `http://YOUR_SERVER_IP:5000/salonpanel`

---

## Flutter App Installation

### Step 1: Development Environment Setup

#### Windows Setup:
1. **Install Flutter SDK**
   - Download Flutter SDK from [Flutter Official Site](https://flutter.dev/docs/get-started/install)
   - Extract to `C:\src\flutter` (avoid Program Files)
   - Add `C:\src\flutter\bin` to PATH environment variable

2. **Install Android Studio**
   - Download from [Android Studio](https://developer.android.com/studio/)
   - Install Android SDK and configure Flutter

3. **Verify Installation**
   ```bash
   flutter doctor
   ```

#### macOS Setup:
1. **Install Flutter SDK**
   - Download and extract Flutter SDK
   - Add to PATH: `export PATH="$PATH:[PATH_TO_FLUTTER_SDK]/flutter/bin"`

2. **Install Xcode**
   - Download from App Store
   - Install Android Studio for Android development

3. **Verify Installation**
   ```bash
   flutter doctor
   ```

### Step 2: Firebase Configuration

1. **Create Firebase Project**
   - Visit [Firebase Console](https://firebase.google.com/)
   - Create new project or use existing one
   - Enable Google Analytics (optional)

2. **Download Private Key**
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Download JSON file securely

3. **Add Android App**
   - Click "Add app" → Android
   - Enter package name (e.g., `com.yourcompany.slotify`)
   - Download `google-services.json`
   - Place in `android/app/` directory

4. **Add iOS App** (for macOS users)
   - Click "Add app" → iOS
   - Enter bundle identifier
   - Download `GoogleService-Info.plist`
   - Add to iOS project

### Step 3: Project Configuration

1. **Extract Flutter Projects**
   - Extract `multi_salon_customer` for customer app
   - Extract `multi_salon_expert` for expert app

2. **Update Configuration**
   - Navigate to `lib/utils/config.dart`
   - Update `baseURL` with your server IP
   - Update `secretKey` with your admin panel secret key

3. **Change Package Name**
   - **Android**: Edit `android/app/src/main/AndroidManifest.xml`
   - **iOS**: Open iOS module in Xcode → Runner → Signing & Capabilities

4. **Customize App**
   - **App Name**: Edit `android/app/src/main/AndroidManifest.xml` and iOS `Info.plist`
   - **App Icon**: Use [App Icon Generator](https://www.appicon.co/)
   - **App Colors**: Edit `lib/utils/color_res.dart`

### Step 4: Build Applications

1. **Debug Build**
   ```bash
   flutter build apk --debug
   ```

2. **Release Build**
   ```bash
   flutter build apk --release
   ```

3. **iOS Build** (macOS only)
   ```bash
   flutter build ios --release
   ```

---

## Post-Installation

### Admin Panel Access:
- URL: `http://YOUR_SERVER_IP:5000/`
- Default credentials will be provided in the installation output

### Salon Panel Access:
- URL: `http://YOUR_SERVER_IP:5000/salonpanel`
- Salon users can login with their email and password

### Mobile Apps:
- Install the generated APK files on Android devices
- For iOS, use Xcode to build and deploy to devices


## Important Notes

1. **Security**: Always change default passwords and keys in production
2. **Backups**: Enable automatic backups for your server
3. **Updates**: Keep your Flutter SDK and dependencies updated
4. **Firebase**: Ensure Firebase project is properly configured for push notifications
5. **SSL**: Consider adding SSL certificates for production use

## Troubleshooting

- **Flutter Doctor Issues**: Follow the official Flutter installation guide
- **Server Connection**: Ensure firewall allows ports 22 (SSH), 80 (HTTP), and 5000 (App)
- **Database Connection**: Verify MongoDB is running and accessible
- **Build Errors**: Check Flutter and Dart versions compatibility

