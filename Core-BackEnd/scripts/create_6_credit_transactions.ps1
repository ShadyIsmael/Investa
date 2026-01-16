# Create 6 random credit transactions for the user using the running backend
$baseUrl = "http://localhost:5000"
$phone = "+2001022322292"
$password = "P@ssw0rd"

$loginPayload = @{
    phoneNumber = $phone
    password = $password
} | ConvertTo-Json

Write-Host "Logging in..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/Auth/login" -Method POST -ContentType "application/json" -Body $loginPayload -UseBasicParsing -TimeoutSec 30
    $loginData = $loginResponse.Content | ConvertFrom-Json

    if ($loginData.success -eq $true) {
        $token = $loginData.data.token
        Write-Host "Login successful! Token received." -ForegroundColor Green
    } else {
        Write-Host "Login failed: $($loginData.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Login request failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Attempt to get userId from login payload, otherwise call clients/by-phone
$userId = $null
if ($loginData.data -and $loginData.data.userId) {
    $userId = $loginData.data.userId
}

if (-not $userId) {
    Write-Host "Fetching client by phone..." -ForegroundColor Yellow
    try {
        $resp = Invoke-WebRequest -Uri "$baseUrl/api/clients/by-phone/$phone" -Method GET -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing -TimeoutSec 30
        $client = $resp.Content | ConvertFrom-Json
        if ($client.userId) { $userId = $client.userId }
        elseif ($client.id) { $userId = $client.id }
    } catch {
        Write-Host "Failed to get client by phone: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

if (-not $userId) { Write-Host "Could not determine userId for $phone" -ForegroundColor Red; exit 1 }

Write-Host "Using userId: $userId" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$transactionTypes = @("Earn", "Spend", "Adjustment")
$descriptions = @(
    "Investment bonus",
    "Referral reward",
    "Monthly interest",
    "Service fee",
    "Cashback reward",
    "Account adjustment"
)

for ($i = 1; $i -le 6; $i++) {
    $amount = Get-Random -Minimum 10 -Maximum 500
    $type = "Earn"
    $description = $descriptions | Get-Random

    $creditPayload = @{
        userId = $userId
        amount = $amount
        type = $type
        description = $description
    } | ConvertTo-Json

    Write-Host "`nCreating Transaction $i..." -ForegroundColor Cyan
    Write-Host "Type: $type, Amount: $amount, Description: $description" -ForegroundColor Gray

    try {
        $creditResponse = Invoke-WebRequest -Uri "$baseUrl/api/credits" -Method POST -Headers $headers -Body $creditPayload -UseBasicParsing -TimeoutSec 30
        $creditData = $creditResponse.Content | ConvertFrom-Json

        Write-Host "Transaction $i created successfully! ID: $($creditData.id)" -ForegroundColor Green
    } catch {
        Write-Host "Transaction $i creation failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorResponse = $reader.ReadToEnd()
            Write-Host "Error details: $errorResponse" -ForegroundColor Red
        }
    }
}

Write-Host "`nAll credit transactions creation attempts completed!" -ForegroundColor Yellow

# Check final credit balance
Write-Host "`nChecking final credit balance..." -ForegroundColor Yellow
try {
    $balanceResponse = Invoke-WebRequest -Uri "$baseUrl/api/credits/$userId" -Method GET -Headers $headers -UseBasicParsing -TimeoutSec 30
    $balanceData = $balanceResponse.Content | ConvertFrom-Json
    $totalCredit = ($balanceData | Measure-Object -Property amount -Sum).Sum
    Write-Host "Total credit balance: $totalCredit" -ForegroundColor Green
} catch {
    Write-Host "Failed to get credit balance: $($_.Exception.Message)" -ForegroundColor Red
}