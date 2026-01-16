param(
    [string]$BaseUrl = 'http://192.168.1.15:5235'
)

Write-Host "Using base URL: $BaseUrl"

function Post-Json($uri, $obj) {
    $json = $obj | ConvertTo-Json
    return Invoke-RestMethod -Method Post -Uri $uri -Body $json -ContentType 'application/json' -ErrorAction Stop
}

try {
    $adminEmail = "admin+$(Get-Random -Maximum 100000)@local.test"
    $adminPass = "P@ssw0rdAdmin!"

    Write-Host "Creating admin: $adminEmail"
    $create = Post-Json "$BaseUrl/api/auth/create-admin" @{ Email = $adminEmail; Password = $adminPass; FirstName = 'Script'; LastName = 'Admin' }
    Write-Host "Admin creation response: $($create | ConvertTo-Json -Depth 2)"
}
catch {
    Write-Host "Admin creation may have failed or already exists: $($_.Exception.Message)"
}

try {
    Write-Host "Logging in admin"
    $login = Post-Json "$BaseUrl/api/auth/login-email" @{ Email = $adminEmail; Password = $adminPass }
    $token = $login.data.token
    if (-not $token) { Write-Error "Failed to obtain admin token"; exit 1 }
    Write-Host "Obtained admin token"
}
catch {
    Write-Host "Admin login failed: $($_.Exception.Message)"; exit 1
}

$headers = @{ Authorization = "Bearer $token" }

$phone = '01022322292'

Write-Host "Attempting to GET client by phone: $phone"
try {
    $client = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/clients/by-phone/$phone" -Headers $headers -ErrorAction Stop
    Write-Host "Found client for $phone"
}
catch {
    Write-Host "Client not found by phone: attempting to create client profile"
    $profile = @{ FirstName = 'shady'; LastName = 'ismael'; MobileNumber = $phone }
    try {
        $created = Post-Json "$BaseUrl/api/clients/by-phone/$phone" $profile -ErrorAction Stop
        $client = $created
        Write-Host "Created client profile for $phone"
    }
    catch {
        Write-Host "Failed to create client by phone: $($_.Exception.Message)"; exit 1
    }
}

# Ensure phone is updated to include +20
if ($client -and $client.userId) {
    $userId = $client.userId
    $currentMobile = $client.mobileNumber
    if (-not $currentMobile) { $currentMobile = $phone }
    if ($currentMobile.StartsWith('+')) { Write-Host "Mobile already has country code: $currentMobile" }
    else {
        if ($currentMobile.StartsWith('0')) { $newMobile = '+20' + $currentMobile.Substring(1) } else { $newMobile = '+20' + $currentMobile }
        Write-Host "Updating mobile $currentMobile -> $newMobile"
        $client.mobileNumber = $newMobile
        $body = $client | ConvertTo-Json -Depth 6
        try {
            $resp = Invoke-RestMethod -Method Put -Uri "$BaseUrl/api/clients/$userId" -Headers $headers -Body $body -ContentType 'application/json' -ErrorAction Stop
            Write-Host "Updated mobile for user $userId"
        }
        catch {
            Write-Host "Failed to update mobile: $($_.Exception.Message)"; exit 1
        }
    }
}

Write-Host "Done"
