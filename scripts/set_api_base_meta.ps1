param(
  [Parameter(Mandatory=$true)] [string]$Url,
  [Parameter(Mandatory=$false)][string[]]$Targets = @('investa-client-portal','investa-admin-portal')
)

foreach ($t in $Targets) {
  $index = Join-Path -Path $PSScriptRoot -ChildPath "..\$t\src\index.html" | Resolve-Path -ErrorAction SilentlyContinue
  if (-not $index) {
    Write-Host "Could not find index.html for $t, skipping" -ForegroundColor Yellow
    continue
  }
  $path = $index.Path
  $html = Get-Content $path -Raw

  if ($html -match '<meta name="investa-api-base"') {
    $new = [regex]::Replace($html, '<meta name="investa-api-base" content="[^"]*"\s*/?>', "<meta name='investa-api-base' content='$Url' />", 'IgnoreCase')
  } else {
    # inject into head
    $new = $html -replace '(?i)(<head[^>]*>)', "`$1`n  <meta name='investa-api-base' content='$Url' />"
  }

  Set-Content -Path $path -Value $new -Encoding UTF8
  Write-Host "Updated $path -> $Url" -ForegroundColor Green
}
