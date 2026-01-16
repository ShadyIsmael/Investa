# Add 12 random score transactions for the user
$baseUrl = "http://10.245.142.220:5235"
$userId = "2ffd2cbf-1de1-4727-abc2-39eaada58af5"

# Login credentials
$loginPayload = @{
    phoneNumber = "+2001022322292"
    password = "P@ssw0rd"
} | ConvertTo-Json

Write-Host "Logging in..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginPayload -UseBasicParsing
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

# Headers for authenticated requests
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Transaction type IDs (assuming some exist, will try different ones if needed)
$transactionTypeIds = @(1, 2, 3, 4, 5)

# Create 12 transactions
for ($i = 1; $i -le 12; $i++) {
    # Generate random data
    $score = Get-Random -Minimum -50 -Maximum 100  # Random score between -50 and +100
    $transactionTypeId = $transactionTypeIds | Get-Random

    $scorePayload = @{
        userId = $userId
        score = $score
        transactionTypeId = $transactionTypeId
    } | ConvertTo-Json

    Write-Host "`nCreating Score Transaction $i..." -ForegroundColor Cyan
    Write-Host "Score: $score, TransactionTypeId: $transactionTypeId" -ForegroundColor Gray

    try {
        $scoreResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/score-transactions" -Method POST -Headers $headers -Body $scorePayload -UseBasicParsing
        $scoreData = $scoreResponse.Content | ConvertFrom-Json

        Write-Host "Score Transaction $i created successfully! ID: $($scoreData.id)" -ForegroundColor Green
    } catch {
        Write-Host "Score Transaction $i creation failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorResponse = $reader.ReadToEnd()
            Write-Host "Error details: $errorResponse" -ForegroundColor Red
        }
    }
}

Write-Host "`nAll score transactions creation attempts completed!" -ForegroundColor Yellow

# Check final score balance
Write-Host "`nChecking final score balance..." -ForegroundColor Yellow
try {
    $balanceResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/clients/$userId/score-transactions" -Method GET -Headers $headers -UseBasicParsing
    $balanceData = $balanceResponse.Content | ConvertFrom-Json
    $totalScore = ($balanceData | Measure-Object -Property score -Sum).Sum
    Write-Host "Total score balance: $totalScore" -ForegroundColor Green
} catch {
    Write-Host "Failed to get score balance: $($_.Exception.Message)" -ForegroundColor Red
}