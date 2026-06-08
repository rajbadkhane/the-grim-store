$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entries = @(
  "127.0.0.1       grim.local",
  "127.0.0.1       admin.grim.local",
  "127.0.0.1       api.grim.local"
)

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Error "Run this script from PowerShell as Administrator."
  exit 1
}

$content = Get-Content $hostsPath -Raw
foreach ($entry in $entries) {
  if ($content -notmatch [regex]::Escape($entry)) {
    Add-Content -Path $hostsPath -Value $entry
  }
}

ipconfig /flushdns | Out-Null
Write-Host "XAMPP local hostnames are ready: grim.local, admin.grim.local, api.grim.local"
