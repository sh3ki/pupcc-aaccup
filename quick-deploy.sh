#!/bin/bash

# Quick Laravel Deployment Script (One-liner version)
# Usage: ./quick-deploy.sh

echo "🚀 Starting quick deployment..."

php artisan down --retry=60 && \
git stash push -m "Local server changes before update - $(date)" && \
git pull origin master && \
composer install --optimize-autoloader --no-dev --no-interaction && \
npm ci && \
npm run build && \
php artisan config:clear && \
php artisan config:cache && \
php artisan route:cache && \
php artisan view:cache && \
php artisan optimize:clear && \
sudo chown -R www-data:www-data ./ && \
sudo chmod -R 755 ./ && \
sudo chmod -R 775 ./storage ./bootstrap/cache && \
sudo systemctl reload nginx && \
pkill -f "soketi" || true && \
nohup npm run soketi > /dev/null 2>&1 & \
php artisan up && \
echo "✅ Quick deployment completed successfully!"
