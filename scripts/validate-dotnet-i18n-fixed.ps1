<#
.SYNOPSIS
    Validates .NET resource files (.resx) for localization parity
.DESCRIPTION
    Checks that EN and AR resource files have matching keys
#>

$ErrorActionPreference = "Stop"

Write-Host "`n=== Validating .NET Backend i18n ===" -ForegroundColor Cyan

$resourcePath = "d:\projects\Investa\gitInvesta\Core-BackEnd\Investa.API\Resources"
$enFile = Join-Path $resourcePath "SharedResource.en.resx"
$arFile = Join-Path $resourcePath "SharedResource.ar.resx"

if (-not (Test-Path $enFile)) {
    Write-Host "âŒ SharedResource.en.resx not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $arFile)) {
    Write-Host "âŒ SharedResource.ar.resx not found" -ForegroundColor Red
    exit 1
}

# Parse XML to extract keys
[xml]$enXml = Get-Content $enFile
[xml]$arXml = Get-Content $arFile

$enKeys = $enXml.root.data | Where-Object { $_.name } | Select-Object -ExpandProperty name | Sort-Object
$arKeys = $arXml.root.data | Where-Object { $_.name } | Select-Object -ExpandProperty name | Sort-Object

Write-Host "âœ… SharedResource.en.resx is valid XML" -ForegroundColor Green
Write-Host "âœ… SharedResource.ar.resx is valid XML" -ForegroundColor Green
Write-Host "ðŸ“Š EN keys: $($enKeys.Count), AR keys: $($arKeys.Count)" -ForegroundColor Cyan

# Check parity
$missingInAr = $enKeys | Where-Object { $_ -notin $arKeys }
$missingInEn = $arKeys | Where-Object { $_ -notin $enKeys }

if ($missingInAr) {
    Write-Host "âŒ $($missingInAr.Count) keys missing in AR: $($missingInAr -join ', ')" -ForegroundColor Red
}

if ($missingInEn) {
    Write-Host "âŒ $($missingInEn.Count) keys missing in EN: $($missingInEn -join ', ')" -ForegroundColor Red
}

if ((-not $missingInAr) -and (-not $missingInEn)) {
    Write-Host "âœ… Key parity OK" -ForegroundColor Green
    
    # Display all keys
    Write-Host "`nðŸ“‹ Resource Keys:" -ForegroundColor Cyan
    foreach ($key in $enKeys) {
        $enValue = ($enXml.root.data | Where-Object { $_.name -eq $key }).value
        $arValue = ($arXml.root.data | Where-Object { $_.name -eq $key }).value
        Write-Host "  â€¢ $key" -ForegroundColor Gray
        Write-Host "    EN: $enValue" -ForegroundColor DarkGray
        Write-Host "    AR: $arValue" -ForegroundColor DarkGray
    }
    
    Write-Host "`nâœ… .NET i18n validation passed" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`nâŒ .NET i18n validation failed" -ForegroundColor Red
    exit 1
}

