# PowerShell script to refresh exhibit tables
# Usage: ./refresh_exhibit_tables.ps1

Write-Host "🔄 Refreshing Exhibit Tables..." -ForegroundColor Green

# Define tables
$tables = @(
    "exhibit_ched_memorandum_order",
    "exhibit_copc", 
    "exhibit_bor",
    "exhibit_psv"
)

# Confirm action
Write-Host "This will drop and recreate the following tables:" -ForegroundColor Yellow
foreach ($table in $tables) {
    Write-Host "  - $table" -ForegroundColor Yellow
}

$confirm = Read-Host "Do you want to continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Operation cancelled." -ForegroundColor Red
    exit
}

Write-Host "📋 Running custom artisan command..." -ForegroundColor Blue
php artisan exhibit:refresh-tables --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Exhibit tables refreshed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Error occurred during refresh" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 All done! You can now test the exhibit pages." -ForegroundColor Green
