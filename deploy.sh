#!/bin/bash

# Laravel Deployment Script for Ubuntu Linux
# Usage: ./deploy.sh
# Make executable with: chmod +x deploy.sh

set -e  # Exit on any error

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

# Function to check if service exists
service_exists() {
    systemctl list-unit-files --type=service | grep -q "^$1.service"
}

print_status "Starting Laravel deployment process..."

# Get the current directory
PROJECT_DIR=$(pwd)
print_status "Project directory: $PROJECT_DIR"

# Check if we're in a Laravel project
if [ ! -f "artisan" ]; then
    print_error "Not in a Laravel project directory! Please run this script from your Laravel root directory."
    exit 1
fi

# Put application in maintenance mode
print_status "Putting application in maintenance mode..."
php artisan down --retry=60 || print_warning "Failed to put app in maintenance mode (might already be down)"

# Stash local changes
print_status "Stashing local changes..."
git stash push -m "Local server changes before update - $(date)"

# Pull latest changes
print_status "Pulling latest changes from master branch..."
git pull origin master

# Install/update Composer dependencies
print_status "Installing Composer dependencies..."
if command_exists composer; then
    composer install --optimize-autoloader --no-dev --no-interaction
else
    print_error "Composer not found! Please install Composer first."
    exit 1
fi

# Install/update NPM dependencies
print_status "Installing NPM dependencies..."
if command_exists npm; then
    npm ci
else
    print_error "NPM not found! Please install Node.js and NPM first."
    exit 1
fi

# Build assets
print_status "Building frontend assets..."
npm run build

# Clear and cache Laravel configurations
print_status "Clearing Laravel caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

print_status "Caching Laravel configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations (optional - uncomment if needed)
# print_status "Running database migrations..."
# php artisan migrate --force

# Optimize Laravel
print_status "Optimizing Laravel..."
php artisan optimize

# Set proper file permissions
print_status "Setting file permissions..."
sudo chown -R www-data:www-data ./
sudo chmod -R 755 ./
sudo chmod -R 775 ./storage ./bootstrap/cache

# Create symbolic link for storage (if not exists)
if [ ! -L "public/storage" ]; then
    print_status "Creating storage symbolic link..."
    php artisan storage:link
fi

# Restart/reload web server
if service_exists nginx; then
    print_status "Reloading Nginx..."
    sudo systemctl reload nginx
    print_success "Nginx reloaded successfully"
elif service_exists apache2; then
    print_status "Reloading Apache..."
    sudo systemctl reload apache2
    print_success "Apache reloaded successfully"
else
    print_warning "No web server (nginx/apache) found to reload"
fi

# Start Soketi in background (WebSocket server)
print_status "Starting Soketi WebSocket server..."
if command_exists npm; then
    # Kill existing soketi processes
    pkill -f "soketi" || true
    # Start soketi in background
    nohup npm run soketi > /dev/null 2>&1 &
    print_success "Soketi started in background"
else
    print_warning "Cannot start Soketi - NPM not found"
fi

# Restart queue workers (if using queues)
if service_exists laravel-worker; then
    print_status "Restarting queue workers..."
    sudo systemctl restart laravel-worker
    print_success "Queue workers restarted"
elif command_exists supervisorctl; then
    print_status "Restarting supervisor queue workers..."
    sudo supervisorctl restart all
    print_success "Supervisor workers restarted"
else
    print_warning "No queue workers found to restart"
fi

# Clear OPcache (if available)
if command_exists php && php -m | grep -q "Zend OPcache"; then
    print_status "Clearing OPcache..."
    php artisan opcache:clear 2>/dev/null || true
fi

# Bring application back online
print_status "Bringing application back online..."
php artisan up

# Verify deployment
print_status "Verifying deployment..."
if php artisan --version >/dev/null 2>&1; then
    print_success "Laravel is responding correctly"
else
    print_error "Laravel verification failed!"
    exit 1
fi

# Final cleanup
print_status "Running final optimization..."
php artisan optimize:clear
php artisan optimize

print_success "🚀 Deployment completed successfully!"
print_status "Application is now live and updated"

# Display useful information
echo ""
echo "==================================="
echo "📊 DEPLOYMENT SUMMARY"
echo "==================================="
echo "📍 Project: $(basename "$PROJECT_DIR")"
echo "⏰ Completed: $(date)"
echo "🌐 Git branch: $(git branch --show-current)"
echo "📦 Git commit: $(git rev-parse --short HEAD)"
echo "🔧 Laravel version: $(php artisan --version | head -n1)"
echo "==================================="
echo ""

# Optional: Show recent git commits
print_status "Recent changes deployed:"
git log --oneline -5

print_success "All done! Your Laravel application has been successfully deployed! 🎉"
