# PowerShell script to run Flutter with optimized settings
$env:FLUTTER_STORAGE_BASE_URL = "https://storage.googleapis.com"
$env:PUB_HOSTED_URL = "https://pub.dev"
$env:GRADLE_OPTS = "-Dorg.gradle.daemon=false -Dorg.gradle.parallel=false -Dorg.gradle.configureondemand=false"
$env:JAVA_OPTS = "-Xmx4096m -XX:+UseG1GC"

Write-Host "Starting Flutter with optimized settings..." -ForegroundColor Green
flutter run --verbose 