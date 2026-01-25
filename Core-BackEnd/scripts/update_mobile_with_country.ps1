param(
    [string]$BaseUrl = 'http://DESKTOP-DIH7CQH:5235',
    [string]$ResultsFile = "$PSScriptRoot\create_accounts_results.json"
)

Write-Host "Using base URL: $BaseUrl"
Write-Host "Reading results from: $ResultsFile"

if (-not (Test-Path $ResultsFile)) { Write-Error "Results file not found: $ResultsFile"; exit 1 }

$results = Get-Content $ResultsFile | ConvertFrom-Json

foreach ($entry in $results) {
    if (-not $entry.success) { Write-Host "Skipping $($entry.phone) (not created)"; continue }

    $token = $entry.response.data.token
    $phone = $entry.response.data.phoneNumber

    if ([string]::IsNullOrWhiteSpace($phone) -or [string]::IsNullOrWhiteSpace($token)) {
        Write-Host "Missing data for entry: $($entry.phone)"; continue
    }

    if ($phone.StartsWith('+')) {
        $newMobile = $phone
    }
    elseif ($phone.StartsWith('0')) {
        $newMobile = '+20' + $phone.Substring(1)
    }
    else {
        $newMobile = '+20' + $phone
    }

    Write-Host "Updating $phone -> $newMobile"

    $headers = @{ Authorization = "Bearer $token" }

    try {
        $client = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/clients/by-phone/$phone" -Headers $headers -ErrorAction Stop
    }
    catch {
        Write-Host "Failed to GET client for ${phone}: $($_.Exception.Message)"; continue
    }

    # Ensure required fields exist on the returned DTO
    $client.MobileNumber = $newMobile

    $userId = $client.userId
    $body = $client | ConvertTo-Json -Depth 6

    try {
        $resp = Invoke-RestMethod -Method Put -Uri "$BaseUrl/api/clients/$userId" -Headers $headers -Body $body -ContentType 'application/json' -ErrorAction Stop
        Write-Host "Updated ${phone} -> ${newMobile}"
    }
    catch {
        Write-Host "Failed to update ${phone}: $($_.Exception.Message)"
    }
}

Write-Host "Done"
