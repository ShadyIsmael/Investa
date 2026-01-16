param([string]$Token)

if (-not $Token) {
    # Default token (from recent test run) - replace if you have a fresh token
    $Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YmQzY2UyNi05YTE3LTRjYjAtYTIzNy0wOWU5MTM1OWNlMmUiLCJpZCI6IjZiZDNjZTI2LTlhMTctNGNiMC1hMjM3LTA5ZTkxMzU5Y2UyZSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiYWRtaW5faW52ZXN0YV9jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9tb2JpbGVwaG9uZSI6IiIsInBob25lX251bWJlciI6IiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6Ik9yZ0FkbWluIiwicm9sZSI6Ik9yZ0FkbWluIiwiZXhwIjoxNzY3NDAxOTU5LCJpc3MiOiJJbnZlc3RhIiwiYXVkIjoiSW52ZXN0YS5DbGllbnQifQ.Ew5tf0pJU8rBngms70z__2wNq6sEJVChgJaA4Mvhtqg'
}

$parts = $Token.Split('.')
if ($parts.Length -lt 2) { Write-Error 'Invalid token format'; exit 1 }
$payload = $parts[1]
$s = $payload.Replace('-','+').Replace('_','/')
switch ($s.Length % 4) { 0 { } 2 { $s += '==' } 3 { $s += '=' } default { } }
$json = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($s))
Try {
    $obj = $json | ConvertFrom-Json
} Catch {
    Write-Output 'Failed to parse JSON payload'
    Write-Output $json
    exit 1
}

Write-Output '--- Claims ---'
foreach ($p in $obj.PSObject.Properties) {
    Write-Output ("$($p.Name): $($p.Value)")
}

Write-Output '--- Role checks ---'
if ($obj.role) { Write-Output ("role (raw): $($obj.role)") }
if ($obj."http://schemas.microsoft.com/ws/2008/06/identity/claims/role") { Write-Output ("role-schema: $($obj.'http://schemas.microsoft.com/ws/2008/06/identity/claims/role')") }

# Exit with success
exit 0
