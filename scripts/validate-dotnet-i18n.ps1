<#
.SYNOPSIS
    Validates .NET resource files (.resx) for localization parity
#>

$ErrorActionPreference = "Stop"

Write-Host "`n=== Validating .NET Backend i18n ===" -ForegroundColor Cyan

$resourcePath = "d:\projects\Investa\gitInvesta\Core-BackEnd\Investa.API\Resources"
$enFile = Join-Path $resourcePath "SharedResource.en.resx"
$arFile = Join-Path $resourcePath "SharedResource.ar.resx"

if (-not (Test-Path $enFile)) {
    Write-Host "ERROR: SharedResource.en.resx not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $arFile)) {
    Write-Host "ERROR: SharedResource.ar.resx not found" -ForegroundColor Red
    exit 1
}

# Parse XML
[xml]$enXml = Get-Content $enFile
[xml]$arXml = Get-Content $arFile

$enKeys = $enXml.root.data | Where-Object { $_.name } | Select-Object -ExpandProperty name | Sort-Object
$arKeys = $arXml.root.data | Where-Object { $_.name } | Select-Object -ExpandProperty name | Sort-Object

Write-Host "OK: SharedResource.en.resx is valid XML" -ForegroundColor Green
Write-Host "OK: SharedResource.ar.resx is valid XML" -ForegroundColor Green
Write-Host "INFO: EN keys: $($enKeys.Count), AR keys: $($arKeys.Count)" -ForegroundColor Cyan

$missingInAr = $enKeys | Where-Object { $_ -notin $arKeys }
$missingInEn = $arKeys | Where-Object { $_ -notin $enKeys }
$hasMissing = $false

if ($missingInAr) {
    Write-Host "ERROR: Keys missing in AR: $($missingInAr -join ', ')" -ForegroundColor Red
    $hasMissing = $true
}

if ($missingInEn) {
    Write-Host "ERROR: Keys missing in EN: $($missingInEn -join ', ')" -ForegroundColor Red
    $hasMissing = $true
}

if ($hasMissing) {
    Write-Host "`nFAIL: .NET i18n validation failed" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Key parity is correct" -ForegroundColor Green
Write-Host "`nSUCCESS: .NET i18n validation passed" -ForegroundColor Green
exit 0
