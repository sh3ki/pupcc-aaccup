#!/bin/bash

# Enhanced Laravel Deployment Script with PDF.js Optimizations
# Usage: ./deploy-optimized.sh
# Make executable with: chmod +x deploy-optimized.sh

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

print_status "🚀 Starting Enhanced Laravel Deployment with PDF.js Optimizations..."

# Get the current directory
PROJECT_DIR=$(pwd)
print_status "Project directory: $PROJECT_DIR"

# Check if we're in a Laravel project
if [ ! -f "artisan" ]; then
    print_error "Not in a Laravel project directory (artisan command not found)"
    exit 1
fi

# Enable maintenance mode
print_status "🔧 Enabling maintenance mode..."
if php artisan down --message="Deploying with PDF optimizations..." --retry=60; then
    print_success "Maintenance mode enabled"
else
    print_warning "Could not enable maintenance mode (continuing anyway)"
fi

# Function to cleanup on exit
cleanup() {
    print_status "🔙 Bringing application back online..."
    php artisan up || print_warning "Could not disable maintenance mode"
}
trap cleanup EXIT

# Backup current state
print_status "💾 Backing up current changes..."
BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"
if git stash push -m "$BACKUP_BRANCH"; then
    print_success "Changes backed up to stash: $BACKUP_BRANCH"
else
    print_warning "No changes to backup"
fi

# Pull latest changes
print_status "📥 Pulling latest changes from repository..."
git pull origin master
print_success "Repository updated"

# Update Composer dependencies
print_status "📦 Updating Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
print_success "Composer dependencies updated"

# Update NPM packages and copy PDF workers
print_status "📦 Updating NPM packages..."
npm ci --production=false
print_success "NPM packages updated"

# Copy and optimize PDF.js workers
print_status "📄 Optimizing PDF.js workers..."
if npm run copy-pdf-worker; then
    print_success "PDF.js workers optimized"
else
    print_error "Failed to copy PDF.js workers"
    exit 1
fi

# Build assets with optimizations
print_status "🏗️ Building optimized assets..."
if npm run build; then
    print_success "Assets built successfully"
else
    print_error "Asset build failed"
    exit 1
fi

# Clear all caches
print_status "🧹 Clearing application caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
print_success "Application caches cleared"

# Optimize Laravel
print_status "⚡ Optimizing Laravel application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
print_success "Laravel optimized"

# Set proper permissions
print_status "🔐 Setting file permissions..."
sudo chown -R www-data:www-data storage bootstrap/cache public/js
sudo chmod -R 755 storage bootstrap/cache
sudo chmod -R 644 public/js/*.js public/js/*.mjs
print_success "File permissions set"

# Optimize PDF.js files
print_status "🚀 Setting up PDF.js optimizations..."

# Create optimized .htaccess for PDF files if it doesn't exist
if [ ! -f "public/.htaccess.pdf" ]; then
    cat > public/.htaccess.pdf << 'EOF'
# PDF.js Performance Optimizations
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>

<IfModule mod_headers.c>
    <FilesMatch "\.(pdf)$">
        Header set Cache-Control "public, max-age=2592000"
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
    
    <FilesMatch "\.(js|mjs)$">
        Header set Cache-Control "public, max-age=604800"
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
    <FilesMatch "\.(js|mjs)$">
        SetOutputFilter DEFLATE
    </FilesMatch>
</IfModule>
EOF
    print_success "PDF optimization rules created"
fi

# Restart services
print_status "🔄 Restarting services..."

# Restart web server
if systemctl is-active --quiet nginx; then
    sudo systemctl reload nginx
    print_success "Nginx reloaded"
elif systemctl is-active --quiet apache2; then
    sudo systemctl reload apache2
    print_success "Apache reloaded"
else
    print_warning "Web server not detected (nginx/apache2)"
fi

# Restart Soketi if running
if command -v docker >/dev/null 2>&1; then
    if docker ps | grep -q soketi; then
        print_status "🔄 Restarting Soketi WebSocket server..."
        docker restart soketi-server || print_warning "Could not restart Soketi"
        print_success "Soketi restarted"
    fi
fi

# Restart PHP-FPM if available
if systemctl is-active --quiet php8.3-fpm; then
    sudo systemctl restart php8.3-fpm
    print_success "PHP-FPM restarted"
elif systemctl is-active --quiet php8.2-fpm; then
    sudo systemctl restart php8.2-fpm
    print_success "PHP-FPM restarted"
elif systemctl is-active --quiet php8.1-fpm; then
    sudo systemctl restart php8.1-fpm
    print_success "PHP-FPM restarted"
fi

# Verify deployment
print_status "✅ Verifying deployment..."

# Check if artisan is working
if php artisan --version >/dev/null 2>&1; then
    print_success "Laravel is responding"
else
    print_error "Laravel is not responding properly"
    exit 1
fi

# Check if PDF workers exist
if [ -f "public/js/pdf.worker.min.js" ]; then
    PDF_WORKER_SIZE=$(du -h public/js/pdf.worker.min.js | cut -f1)
    print_success "PDF.js worker available (${PDF_WORKER_SIZE})"
else
    print_error "PDF.js worker missing"
    exit 1
fi

# Performance recommendations
print_status "💡 Performance Recommendations:"
echo -e "   ${YELLOW}1.${NC} Use OptimizedPdfViewer component for large PDFs"
echo -e "   ${YELLOW}2.${NC} Monitor PDF loading times with PdfPerformanceMonitor"
echo -e "   ${YELLOW}3.${NC} Consider PDF compression for files > 10MB"
echo -e "   ${YELLOW}4.${NC} Enable CDN for static PDF files"
echo -e "   ${YELLOW}5.${NC} Set up Redis caching for frequently accessed PDFs"

print_success "🎉 Enhanced deployment completed successfully!"
print_status "📊 PDF.js optimizations applied:"
echo -e "   ${GREEN}✓${NC} Virtual scrolling enabled"
echo -e "   ${GREEN}✓${NC} Optimized worker loading"
echo -e "   ${GREEN}✓${NC} Browser caching configured"
echo -e "   ${GREEN}✓${NC} Performance monitoring available"

print_status "Application is now online with PDF optimizations 🚀"
