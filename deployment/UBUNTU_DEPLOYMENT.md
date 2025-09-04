# Ubuntu Deployment Commands for PUPCC AACCUP

## Quick Deployment Commands

After pulling your changes, run these commands on your Ubuntu server:

```bash
# 1. Navigate to your project directory
cd /var/www/pupcc-aaccup

# 2. Pull latest changes
git pull origin master

# 3. Install dependencies
composer install --optimize-autoloader --no-dev
npm ci

# 4. Copy PDF.js worker files (multiple options)

# Option A: Use Node.js script (recommended)
npm run copy-pdf-worker

# Option B: Use bash script (fallback)
npm run copy-pdf-worker:bash

# Option C: Manual copy (if above fails)
mkdir -p public/js
cp node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs public/js/pdf.worker.mjs
cp node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs public/js/pdf.worker.min.js

# 5. Build assets
npm run build

# If build fails due to PDF worker copy, try:
vite build

# 6. Run database migrations
php artisan migrate --force

# 7. Clear and cache configuration
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 8. Set proper permissions
sudo chown -R www-data:www-data ./
sudo chmod -R 755 ./
sudo chmod -R 775 ./storage ./bootstrap/cache

# 9. Restart web server
sudo systemctl restart apache2
```

## Verify PDF.js Setup

```bash
# Check if worker files exist
ls -la public/js/pdf.worker.*

# Test HTTP accessibility
curl -I http://yourdomain.com/js/pdf.worker.min.js

# Check MIME type
curl -I http://yourdomain.com/js/pdf.worker.min.js | grep Content-Type

# Should return: Content-Type: application/javascript
```

## Test New Exhibit Pages

Visit these URLs to test the new exhibits:
- http://yourdomain.com/exhibit/copc
- http://yourdomain.com/exhibit/bor  
- http://yourdomain.com/exhibit/psv

## Admin Pages

Visit these URLs to manage exhibits:
- http://yourdomain.com/admin/exhibit-copc
- http://yourdomain.com/admin/exhibit-bor
- http://yourdomain.com/admin/exhibit-psv

## Troubleshooting

### If PDF.js worker files don't copy:

```bash
# Manual verification and copy
echo "Checking source files..."
ls -la node_modules/pdfjs-dist/legacy/build/pdf.worker.*

echo "Creating directory..."
mkdir -p public/js

echo "Copying files manually..."
cp node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs public/js/pdf.worker.mjs
cp node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs public/js/pdf.worker.min.js

echo "Verifying copied files..."
ls -la public/js/pdf.worker.*
```

### If build fails:

```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules
npm install
npm run copy-pdf-worker
npm run build
```

### If permissions are wrong:

```bash
# Fix all permissions
sudo chown -R $USER:www-data ./
sudo chmod -R 755 ./
sudo chmod -R 775 ./storage ./bootstrap/cache ./public/js
sudo chmod 644 ./public/js/pdf.worker.*
```

## Apache Configuration

Ensure your Apache vhost has this configuration:

```apache
<IfModule mod_mime.c>
    AddType application/javascript .mjs
    AddType application/javascript .js
    AddType text/javascript .mjs
    AddType text/javascript .js
</IfModule>

<FilesMatch "\.(mjs|js)$">
    <IfModule mod_headers.c>
        Header set Content-Type "application/javascript"
        Header set Access-Control-Allow-Origin "*"
        Header set Cache-Control "public, max-age=31536000"
    </IfModule>
</FilesMatch>
```

Enable required modules:
```bash
sudo a2enmod mime
sudo a2enmod headers
sudo systemctl restart apache2
```
