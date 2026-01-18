# Build Fix Script for Flutter App
Write-Host "Starting build fix process..." -ForegroundColor Cyan

# Step 1: Clean Flutter
Write-Host "`n[1/4] Cleaning Flutter build cache..." -ForegroundColor Yellow
flutter clean

# Step 2: Get dependencies
Write-Host "`n[2/4] Getting Flutter dependencies..." -ForegroundColor Yellow
flutter pub get

# Step 3: Clean Android
Write-Host "`n[3/4] Cleaning Android Gradle cache..." -ForegroundColor Yellow
Set-Location android
.\gradlew clean
Set-Location ..

# Step 4: Try building
Write-Host "`n[4/4] Building Android app..." -ForegroundColor Yellow
flutter build apk --debug

Write-Host "`nBuild process completed!" -ForegroundColor Green
