# Laravel Deployment Scripts

This repository contains automated deployment scripts for your Laravel application on Ubuntu Linux.

## 📁 Files Created

1. **`deploy.sh`** - Full featured deployment script with logging and error handling
2. **`quick-deploy.sh`** - Simplified one-liner version for quick deployments
3. **`DEPLOYMENT.md`** - This documentation file

## 🚀 Quick Start

### 1. Make Scripts Executable

```bash
chmod +x deploy.sh
chmod +x quick-deploy.sh
```

### 2. Run Deployment

**Full Deployment (Recommended):**
```bash
./deploy.sh
```

**Quick Deployment:**
```bash
./quick-deploy.sh
```

## 🔧 What the Scripts Do

### Full Deployment Process (`deploy.sh`)

1. **Maintenance Mode** - Puts app in maintenance mode
2. **Backup Changes** - Stashes local changes with timestamp
3. **Update Code** - Pulls latest changes from master branch
4. **Dependencies** - Updates Composer and NPM packages
5. **Build Assets** - Compiles frontend assets
6. **Cache Management** - Clears and rebuilds Laravel caches
7. **Permissions** - Sets proper file permissions for web server
8. **Services** - Reloads Nginx/Apache and restarts Soketi
9. **Verification** - Checks if deployment was successful
10. **Go Live** - Brings application back online

### Features

- ✅ **Error Handling** - Stops on any error
- ✅ **Colored Output** - Easy to read status messages  
- ✅ **Service Detection** - Automatically detects web server type
- ✅ **Permission Management** - Sets correct file permissions
- ✅ **WebSocket Support** - Handles Soketi restart
- ✅ **Queue Workers** - Restarts background workers
- ✅ **Verification** - Confirms successful deployment

## 📋 Prerequisites

Before running the scripts, ensure you have:

- **Git** - For version control
- **PHP** - Laravel runtime
- **Composer** - PHP dependency manager
- **Node.js & NPM** - For frontend assets
- **Web Server** - Nginx or Apache
- **Proper Permissions** - sudo access for system commands

## 🔒 Permissions Setup

The script requires sudo access for:
- Setting file permissions (`chown`, `chmod`)
- Reloading web server (`systemctl`)
- Managing services

## 🛠️ Customization

### Environment-Specific Modifications

Edit the scripts to match your environment:

```bash
# Change web server if using Apache
sudo systemctl reload apache2

# Modify paths if different
PROJECT_DIR="/var/www/your-app"

# Add database migrations if needed
php artisan migrate --force
```

### Additional Commands

You can add these commands if needed:

```bash
# Database migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force

# Clear specific caches
php artisan route:clear
php artisan view:clear
php artisan config:clear

# Restart PHP-FPM
sudo systemctl restart php8.3-fpm
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x deploy.sh
   ```

2. **Web Server Not Found**
   - Check if nginx/apache is installed
   - Modify script to use your web server

3. **Composer/NPM Not Found**
   - Install missing dependencies
   - Check PATH variables

4. **Git Issues**
   - Ensure you're in a git repository
   - Check git remote configuration

### Manual Fallback

If scripts fail, run commands manually:

```bash
php artisan down
git pull origin master
composer install --no-dev
npm ci && npm run build
php artisan config:cache
sudo chown -R www-data:www-data ./
sudo systemctl reload nginx
php artisan up
```

## 📝 Logs

The full deployment script provides detailed logging:
- **[INFO]** - General information
- **[SUCCESS]** - Successful operations
- **[WARNING]** - Non-critical issues
- **[ERROR]** - Critical errors

## 🔄 Automation

### Cron Job Setup

To automate deployments (use with caution):

```bash
# Edit crontab
crontab -e

# Add line for daily deployment at 2 AM
0 2 * * * cd /var/www/your-app && ./deploy.sh >> /var/log/deployment.log 2>&1
```

### Webhook Integration

For GitHub/GitLab webhooks, create a simple PHP endpoint:

```php
<?php
// webhook.php
if ($_POST['secret'] === 'your-secret-key') {
    shell_exec('cd /var/www/your-app && ./deploy.sh > /dev/null 2>&1 &');
    echo "Deployment triggered";
}
?>
```

## ⚠️ Important Notes

1. **Backup First** - Always backup before deployment
2. **Test Environment** - Test scripts in staging first
3. **Maintenance Window** - Plan deployments during low traffic
4. **Monitor Logs** - Check application logs after deployment
5. **Rollback Plan** - Have a rollback strategy ready

## 📞 Support

If you encounter issues:
1. Check the error messages in the script output
2. Verify all prerequisites are installed
3. Test individual commands manually
4. Check Laravel logs: `storage/logs/laravel.log`

---

**Happy Deploying! 🚀**
