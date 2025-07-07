@echo off
set FLUTTER_STORAGE_BASE_URL=https://storage.googleapis.com
set PUB_HOSTED_URL=https://pub.dev
set FLUTTER_TOOLS_DIR=C:\src\flutter\bin\cache\artifacts\engine\windows-x64
set PATH=%FLUTTER_TOOLS_DIR%;%PATH%

REM Set Windows-specific environment variables
set GRADLE_OPTS=-Dorg.gradle.daemon=false -Dorg.gradle.parallel=false
set JAVA_OPTS=-Xmx4096m -XX:+UseG1GC

echo Starting Flutter with optimized settings...
flutter run --verbose
pause 