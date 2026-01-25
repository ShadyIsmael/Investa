$ErrorActionPreference='Stop'

# Accept self-signed/dev certificates for this test run
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$body = @{ email='admin@investa.com'; password='P@ssw0rd' } | ConvertTo-Json

$baseUrls = @(
    'https://localhost:7292',
    'https://127.0.0.1:7292',
    'https://DESKTOP-DIH7CQH:7292',
    'http://localhost:5235',
    'http://127.0.0.1:5235',
    'http://DESKTOP-DIH7CQH:5235'
)

$login = $null
$usedBase = $null
foreach ($b in $baseUrls) {
    try {
        $uri = "$b/api/auth/login-email"
        $login = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType 'application/json'
        $usedBase = $b
        break
    } catch {
        # continue trying other bases
    }
}

if (-not $login) { Write-Output '--- LOGIN FAILED ON ALL BASE URLS ---'; exit 1 }

Write-Output "--- LOGIN RESPONSE (base: $usedBase) ---"
$login | ConvertTo-Json -Depth 5

$token = $null
if ($null -ne $login.data) { $token = $login.data.token }
if (-not $token -and $null -ne $login.data) { $token = $login.data.Token }
if (-not $token -and $login.Token) { $token = $login.Token }

Write-Output '--- TOKEN ---'
Write-Output $token

if (-not $token) { Write-Output 'No token obtained; aborting admin request.'; exit 1 }

$hdr = @{ Authorization = "Bearer $token" }
try {
    $top = Invoke-RestMethod -Uri "$usedBase/api/v1/admin/clients/top" -Headers $hdr -Method Get
    Write-Output '--- ADMIN TOP RESPONSE ---'
    $top | ConvertTo-Json -Depth 5
} catch {
    Write-Output '--- ADMIN CALL ERROR ---'
    Write-Output $_.Exception.ToString()
    exit 1
}
