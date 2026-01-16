# Add 12 random credit transactions for the user
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

# Transaction types and descriptions
$transactionTypes = @("Earn", "Spend", "Adjustment")
$descriptions = @(
    "Investment bonus",
    "Referral reward",
    "Monthly interest",
    "Service fee",
    "Cashback reward",
    "Account adjustment",
    "Premium subscription",
    "Transaction fee",
    "Loyalty points",
    "System correction",
    "Bonus credits",
    "Penalty deduction"
)

# Create 12 transactions
for ($i = 1; $i -le 12; $i++) {
    # Generate random data
    $amount = Get-Random -Minimum -500 -Maximum 1000  # Random amount between -500 and +1000
    $type = $transactionTypes | Get-Random
    $description = $descriptions | Get-Random

    # For Earn transactions, ensure positive amount
    if ($type -eq "Earn" -and $amount -lt 0) {
        $amount = [Math]::Abs($amount)
    }
    # For Spend transactions, ensure negative amount
    elseif ($type -eq "Spend" -and $amount -gt 0) {
        $amount = -$amount
    }
    # Adjustment can be either

    $creditPayload = @{
        userId = $userId
        amount = $amount
        type = $type
        description = $description
    } | ConvertTo-Json

    Write-Host "`nCreating Transaction $i..." -ForegroundColor Cyan
    Write-Host "Type: $type, Amount: $amount, Description: $description" -ForegroundColor Gray

    try {
        $creditResponse = Invoke-WebRequest -Uri "$baseUrl/api/credits" -Method POST -Headers $headers -Body $creditPayload -UseBasicParsing
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
    $balanceResponse = Invoke-WebRequest -Uri "$baseUrl/api/credits/$userId" -Method GET -Headers $headers -UseBasicParsing
    $balanceData = $balanceResponse.Content | ConvertFrom-Json
    $totalCredit = ($balanceData | Measure-Object -Property amount -Sum).Sum
    Write-Host "Total credit balance: $totalCredit" -ForegroundColor Green
} catch {
    Write-Host "Failed to get credit balance: $($_.Exception.Message)" -ForegroundColor Red
}