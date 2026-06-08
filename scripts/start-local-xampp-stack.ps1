$root = Split-Path -Parent $PSScriptRoot

Start-Process -FilePath "C:\xampp\apache_start.bat" -WorkingDirectory "C:\xampp" -WindowStyle Hidden
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$root\client" -WindowStyle Hidden -RedirectStandardOutput "$root\client-dev.log" -RedirectStandardError "$root\client-dev.err.log"
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$root\admin" -WindowStyle Hidden -RedirectStandardOutput "$root\admin-dev.log" -RedirectStandardError "$root\admin-dev.err.log"

Write-Host "Storefront: http://grim.local"
Write-Host "Admin:      http://admin.grim.local"
Write-Host "API:        http://api.grim.local/api/v1/health"
Write-Host "Start MongoDB before running the API server: npm --prefix server run dev"
