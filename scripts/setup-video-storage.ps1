# Ensure storage link exists
if (-not (Test-Path "public\storage" -PathType Container)) {
    Write-Host "Creating storage link..." -ForegroundColor Yellow
    php artisan storage:link
    Write-Host "Storage link created." -ForegroundColor Green
} else {
    Write-Host "Storage link already exists." -ForegroundColor Green
}

# Create landing/videos directory in storage if it doesn't exist
if (-not (Test-Path "storage\app\public\landing\videos" -PathType Container)) {
    Write-Host "Creating landing/videos directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "storage\app\public\landing\videos" -Force
    Write-Host "Landing/videos directory created." -ForegroundColor Green
} else {
    Write-Host "Landing/videos directory already exists." -ForegroundColor Green
}

Write-Host "✅ Video storage setup complete!" -ForegroundColor Green