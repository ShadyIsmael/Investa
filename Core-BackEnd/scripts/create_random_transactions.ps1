param()

# Config
$BaseUrl = 'http://DESKTOP-DIH7CQH:5235'
$Phone = '01022322292'
$Password = 'P@ssw0rd'

Write-Host "Logging in $Phone -> $BaseUrl"

function Invoke-JsonPost($uri, $body, $headers = $null) {
    $json = $body | ConvertTo-Json -Depth 5
    if ($headers) {
        return Invoke-RestMethod -Uri $uri -Method Post -Body $json -ContentType 'application/json' -Headers $headers -ErrorAction Stop
    } else {
        return Invoke-RestMethod -Uri $uri -Method Post -Body $json -ContentType 'application/json' -ErrorAction Stop
    }
}

try {
    $loginBody = @{ phoneNumber = $Phone; password = $Password }
    $loginResp = Invoke-JsonPost "$BaseUrl/api/auth/login" $loginBody
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$token = $null
if ($loginResp -ne $null) {
    try { $token = $loginResp.data.token } catch { }
    if (-not $token) { try { $token = $loginResp.data.Token } catch { } }
    if (-not $token) { try { $token = $loginResp.Token } catch { } }
}

if (-not $token) {
    Write-Host "Failed to extract token from login response:" -ForegroundColor Red
    $loginResp | ConvertTo-Json -Depth 5
    exit 1
}

Write-Host "Got token"

$headers = @{ Authorization = "Bearer $token" }

try {
    $client = Invoke-RestMethod -Uri "$BaseUrl/api/clients/by-phone/$Phone" -Method Get -Headers $headers -ErrorAction Stop
} catch {
    Write-Host "Failed to fetch client by phone: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$userId = $null
if ($client -is [System.Collections.IDictionary]) { $userId = $client.userId -or $client.UserId }

if (-not $userId) {
    Write-Host "Failed to determine userId from client response:" -ForegroundColor Red
    $client | ConvertTo-Json -Depth 5
    exit 1
}

Write-Host "Creating transactions for user $userId"

$rand = New-Object System.Random

$creditCount = 10
$scoreCount = 10

$createdCredits = @()
$createdScores = @()

for ($i=0; $i -lt $creditCount; $i++) {
    $amount = [math]::Round(($rand.NextDouble() * 495.0) + 5.0, 2)
    $types = @('Earn','Spend','Adjustment')
    $txType = $types[$rand.Next(0,$types.Length)]
    $desc = "Auto-generated credit tx #$($i+1)"
    $ref = $rand.Next(1,9999)
    $body = @{ userId = $userId; amount = $amount; type = $txType; description = $desc; referenceId = $ref }
    try {
        $res = Invoke-JsonPost "$BaseUrl/api/credits" $body $headers
        $createdCredits += $res
        Write-Host "Credit $($i+1): amount=$amount -> OK"
    } catch {
        Write-Host "Credit $($i+1) failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 150
}

for ($i=0; $i -lt $scoreCount; $i++) {
    $score = [math]::Round(($rand.NextDouble() * 19.0) + 1.0, 2)
    $txTypes = @(200,201,202)
    $txTypeId = $txTypes[$rand.Next(0,$txTypes.Length)]
    $reviewerId = $null
    if ($rand.NextDouble() -lt 0.3) { $reviewerId = [guid]::NewGuid().ToString() }
    $body = @{ userId = $userId; score = $score; transactionTypeId = $txTypeId; reviewerId = $reviewerId }
    try {
        $res = Invoke-JsonPost "$BaseUrl/api/v1/score-transactions" $body $headers
        $createdScores += $res
        Write-Host "Score $($i+1): score=$score type=$txTypeId -> OK"
    } catch {
        Write-Host "Score $($i+1) failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 150
}

Write-Host "Done. Created $($createdCredits.Count) credit txs and $($createdScores.Count) score txs"
Write-Host "Note: API sets CreatedAt to current time; cannot backdate via API."
