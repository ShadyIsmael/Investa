$ErrorActionPreference = 'Stop'
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$base = 'http://192.168.1.15:5235'

Write-Output 'Requesting token via /api/auth/token'
try {
    $tokenResp = Invoke-RestMethod -Uri "$base/api/auth/token" -Method Post -Body (@{ email = 'admin@investa.com' } | ConvertTo-Json) -ContentType 'application/json'
    Write-Output "Token response (raw): $($tokenResp)"
} catch {
    Write-Output 'Token request failed:'
    Write-Output $_.Exception.Message
    exit 1
}

$token = $null
# /api/auth/token returns a plain string token; handle both object and string
if ($tokenResp -is [string]) { $token = $tokenResp } elseif ($tokenResp.token) { $token = $tokenResp.token } else { $token = $tokenResp }

Write-Output 'Decoding token payload (claims):'
$parts = $token.Split('.')
if ($parts.Length -lt 2) { Write-Output 'Invalid token format'; exit 1 }
$payload = $parts[1]
$s = $payload.Replace('-','+').Replace('_','/')
if ($s.Length % 4 -eq 2) { $s += '==' } elseif ($s.Length % 4 -eq 3) { $s += '=' }
$json = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($s))
try { $obj = $json | ConvertFrom-Json } catch { Write-Output 'Failed to parse JSON payload'; Write-Output $json; exit 1 }

foreach ($p in $obj.PSObject.Properties) { Write-Output ("$($p.Name): $($p.Value)") }

$roleClaim = $null
if ($obj.role) { $roleClaim = $obj.role }
if (-not $roleClaim -and $obj.'http://schemas.microsoft.com/ws/2008/06/identity/claims/role') { $roleClaim = $obj.'http://schemas.microsoft.com/ws/2008/06/identity/claims/role' }
Write-Output "Detected role claim: $roleClaim"

# Use token to call admin endpoint
Write-Output 'Calling admin endpoint /api/v1/admin/clients/top'
try {
    $hdr = @{ Authorization = "Bearer $token" }
    $top = Invoke-RestMethod -Uri "$base/api/v1/admin/clients/top" -Headers $hdr -Method Get -ErrorAction Stop
    Write-Output 'Admin /top response:'
    $top | ConvertTo-Json -Depth 5
} catch {
    Write-Output 'Admin call failed:'
    Write-Output $_.Exception.Message
    if ($_.Exception.Response) { Write-Output ('Status: ' + $_.Exception.Response.StatusCode.Value__) }
    exit 1
}

Write-Output 'Done.'
