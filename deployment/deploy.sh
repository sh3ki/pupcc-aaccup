#!/bin/bash

# Laravel + PDF.js Production Deployment Script for Ubuntu
# Usage: ./deploy.sh

set -e

echo "🚀 Starting Laravel deployment..."

# Configuration
PROJECT_PATH="/var/www/html/pupcc-aaccup"
BACKUP_PATH="/var/backups/pupcc-aaccup"
WEB_USER="www-data"
DATE=$(date +"%Y%m%d_%H%M%S")

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

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_PATH" ]; then
    print_error "Project directory $PROJECT_PATH does not exist"
    exit 1
fi

cd "$PROJECT_PATH"

print_status "Creating backup..."
sudo mkdir -p "$BACKUP_PATH"
sudo tar -czf "$BACKUP_PATH/backup_$DATE.tar.gz" -C "$(dirname "$PROJECT_PATH")" "$(basename "$PROJECT_PATH")" --exclude='node_modules' --exclude='.git'

print_status "Putting application in maintenance mode..."
php artisan down --retry=60 --secret="deployment-secret-key"

print_status "Pulling latest changes from Git..."
git fetch origin
git reset --hard origin/master

print_status "Installing/updating Composer dependencies..."
composer install --optimize-autoloader --no-dev --no-interaction

print_status "Installing/updating NPM dependencies..."
npm ci --only=production

print_status "Copying PDF.js worker files and building assets..."
if npm run copy-pdf-worker; then
    print_status "✓ PDF.js worker files copied successfully"
else
    print_warning "⚠ PDF.js worker copy failed, trying bash fallback..."
    npm run copy-pdf-worker:bash || print_error "Failed to copy PDF.js worker files"
fi

npm run build

print_status "Running database migrations..."
php artisan migrate --force --no-interaction

print_status "Clearing and caching configuration..."
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

print_status "Setting proper file permissions..."
sudo chown -R $USER:$WEB_USER ./
sudo chmod -R 755 ./
sudo chmod -R 775 ./storage ./bootstrap/cache
sudo chmod -R 664 ./storage/logs/*.log 2>/dev/null || true

print_status "Verifying PDF.js worker files..."
if [ -f "public/js/pdf.worker.min.js" ]; then
    print_status "✓ PDF worker (.js) file exists"
else
    print_warning "⚠ PDF worker (.js) file missing - running copy script..."
    npm run copy-pdf-worker
fi

if [ -f "public/js/pdf.worker.mjs" ]; then
    print_status "✓ PDF worker (.mjs) file exists"
else
    print_warning "⚠ PDF worker (.mjs) file missing"
fi

print_status "Testing PDF worker file accessibility..."
if curl -s -I "http://localhost/js/pdf.worker.min.js" | grep -q "200 OK"; then
    print_status "✓ PDF worker file is accessible via HTTP"
else
    print_warning "⚠ PDF worker file may not be accessible - check Apache configuration"
fi

print_status "Restarting web server..."
sudo systemctl reload apache2

print_status "Bringing application back online..."
php artisan up

print_status "Running health checks..."
if curl -s -I "http://localhost" | grep -q "200 OK"; then
    print_status "✓ Application is responding"
else
    print_error "✗ Application is not responding properly"
    exit 1
fi

# Test exhibit pages
print_status "Testing new exhibit pages..."
for page in "copc" "bor" "psv"; do
    if curl -s -I "http://localhost/exhibit/$page" | grep -q "200 OK"; then
        print_status "✓ Exhibit $page page is accessible"
    else
        print_warning "⚠ Exhibit $page page is not accessible"
    fi
done

print_status "🎉 Deployment completed successfully!"
print_status "Backup created at: $BACKUP_PATH/backup_$DATE.tar.gz"
print_status "Application is now live and PDF.js should work properly"

echo ""
echo "Next steps:"
echo "1. Test PDF viewing functionality on exhibit pages"
echo "2. Check browser console for any PDF.js worker errors"
echo "3. Monitor application logs for any issues"
echo "4. Test document upload/viewing in admin panel"
