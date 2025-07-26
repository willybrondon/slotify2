# Flutter Build Troubleshooting Guide

This guide addresses common Flutter build issues encountered in the Slotify project.

## Issues Fixed

### 1. Geolocator Package Compatibility Error

**Error:**
```
../../../../../../.pub-cache/hosted/pub.dev/geolocator_android-5.0.1+1/lib/src/types/foreground_settings.dart:122:23: Error: The method 'toARGB32' isn't defined for the class 'Color'.
```

**Solution:**
- Downgraded `geolocator` from `^14.0.0` to `^10.1.0` in all pubspec.yaml files
- Updated `flutter_lints` from `^5.0.0` to `^3.0.0` for better compatibility

**Files Updated:**
- `dev/flutter/multi_salon_customer/pubspec.yaml`
- `dev/flutter/multi_salon_expert/pubspec.yaml`
- `prd/flutter/multi_salon_customer/pubspec.yaml`
- `prd/flutter/multi_salon_expert/pubspec.yaml`

### 2. Windows Path Length Issues

**Error:**
```
UNZIP, error access too long
```

**Causes:**
- Windows has a 260-character path length limit
- Deep nested directories in Flutter projects
- Long project paths

**Solutions:**

#### Option 1: Enable Long Path Support (Recommended)
```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

#### Option 2: Move Project to Shorter Path
```bash
# Move project to a shorter path like C:\slotify
mv "D:\Multi Saloon All File\slotify2" C:\slotify
```

#### Option 3: Use PowerShell Script
Use the provided PowerShell script that handles path issues better:
```powershell
.\scripts\build-flutter.ps1 -BuildType android -Environment dev
```

### 3. Gradle Daemon Issues

**Error:**
```
The message received from the daemon indicates that the daemon has disappeared.
```

**Solutions:**

#### Clean Gradle Cache
```bash
cd android
./gradlew clean
./gradlew --stop
```

#### Clear Flutter Cache
```bash
flutter clean
flutter pub get
```

#### Restart Gradle Daemon
```bash
./gradlew --stop
./gradlew --start
```

## Build Scripts

### For Windows (PowerShell)
```powershell
# Build Android apps (dev environment)
.\scripts\build-flutter.ps1 -BuildType android -Environment dev

# Build Android apps (prod environment)
.\scripts\build-flutter.ps1 -BuildType android -Environment prd

# Build iOS apps
.\scripts\build-flutter.ps1 -BuildType ios -Environment dev
```

### For Windows (Batch)
```cmd
# Build Android apps (dev environment)
scripts\build-flutter.bat android dev

# Build Android apps (prod environment)
scripts\build-flutter.bat android prd

# Build iOS apps
scripts\build-flutter.bat ios dev
```

### For Linux/macOS
```bash
# Build Android apps (dev environment)
./scripts/build-flutter.sh android dev

# Build Android apps (prod environment)
./scripts/build-flutter.sh android prd

# Build iOS apps
./scripts/build-flutter.sh ios dev
```

## Manual Build Steps

If scripts don't work, follow these manual steps:

### 1. Clean Everything
```bash
# Navigate to Flutter project
cd dev/flutter/multi_salon_customer

# Clean Flutter
flutter clean

# Clean Android
cd android
./gradlew clean
cd ..

# Get dependencies
flutter pub get
```

### 2. Build APK
```bash
# Build release APK
flutter build apk --release

# Build debug APK (for testing)
flutter build apk --debug
```

### 3. Build iOS
```bash
# Build iOS (requires macOS)
flutter build ios --release --no-codesign
```

## CI/CD Pipeline Fixes

### GitHub Actions Workflow
Update your CI/CD workflow to include these steps:

```yaml
- name: Setup Flutter
  uses: subosito/flutter-action@v2
  with:
    flutter-version: '3.27.4'
    channel: 'stable'

- name: Get dependencies
  run: |
    cd dev/flutter/multi_salon_customer
    flutter pub get
    cd ../multi_salon_expert
    flutter pub get

- name: Build Android APK
  run: |
    cd dev/flutter/multi_salon_customer
    flutter build apk --release
    cd ../multi_salon_expert
    flutter build apk --release
```

## Environment Variables

Make sure these environment variables are set in your CI/CD:

```bash
FLUTTER_VERSION=3.27.4
JAVA_VERSION=17.0.12
ANDROID_SDK_ROOT=/path/to/android/sdk
```

## Common Issues and Solutions

### 1. Memory Issues
If you encounter memory issues during build:

```bash
# Increase Gradle memory
export GRADLE_OPTS="-Xmx4096m -XX:MaxPermSize=512m"

# Or add to gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

### 2. Network Issues
If you have network connectivity issues:

```bash
# Use mirrors
flutter pub get --mirror=https://pub.flutter-io.cn
```

### 3. Permission Issues
If you encounter permission issues:

```bash
# Fix permissions (Linux/macOS)
chmod +x android/gradlew
chmod +x scripts/build-flutter.sh
```

## Verification Steps

After fixing issues, verify the build:

### 1. Check Flutter Doctor
```bash
flutter doctor -v
```

### 2. Test Build
```bash
# Test debug build
flutter build apk --debug

# Test release build
flutter build apk --release
```

### 3. Check APK
```bash
# Verify APK was created
ls -la build/app/outputs/flutter-apk/
```

## Support

If you continue to experience issues:

1. Check Flutter GitHub issues: https://github.com/flutter/flutter/issues
2. Check package-specific issues on pub.dev
3. Verify your Flutter and Dart versions are compatible
4. Ensure all dependencies are compatible with your Flutter version

## Version Compatibility

Current compatible versions:
- Flutter: 3.27.4
- Dart: 3.6.2
- geolocator: ^10.1.0
- flutter_lints: ^3.0.0 