# Fix user role and create 5 investments
$baseUrl = "http://10.245.142.220:5235"
$phone = "+2001022322292"
$password = "P@ssw0rd"

# First, we need to update the role in the database
# Get connection string from appsettings
$appSettings = Get-Content "d:\projects\Investa\gitInvesta\Core-BackEnd\Investa.API\appsettings.Development.json" | ConvertFrom-Json
$connectionString = $appSettings.ConnectionStrings.DefaultConnection

Write-Host "Updating user role in database..." -ForegroundColor Yellow

# SQL to update the role for this user
$updateRoleSql = @"
UPDATE "User" 
SET "Role" = 'Client' 
WHERE "Email" LIKE '%$phone%' OR "Name" LIKE '%$phone%';
"@

# Execute the SQL update using psql
try {
    $env:PGPASSWORD = "postgres"  # Adjust if needed
    $updateRoleSql | psql -h localhost -U postgres -d Investa -c "$updateRoleSql"
    Write-Host "Role updated successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to update role: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}

# Now login to get a fresh token with the updated role
$loginPayload = @{
    phoneNumber = $phone
    password = $password
} | ConvertTo-Json

Write-Host "`nLogging in..." -ForegroundColor Yellow
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

# Business data for random generation
$businessNames = @("TechStart Solutions", "GreenEnergy Corp", "FoodieHub", "MediCare Plus", "EduLearn Platform", "SmartHome IoT", "LogiChain", "FitLife App", "AutoDrive AI", "CryptoWallet")
$descriptions = @(
    "Revolutionary technology startup",
    "Sustainable energy solutions",
    "Food delivery platform",
    "Healthcare management system",
    "Online learning platform",
    "Smart home automation",
    "Logistics optimization",
    "Fitness tracking application",
    "Autonomous driving technology",
    "Cryptocurrency wallet service"
)
$milestones = @("MVP Development", "Beta Testing", "Market Launch", "User Acquisition", "Revenue Generation", "Scale Operations")
$currencies = @("EGP", "USD", "EUR")

# Create 5 investments
for ($i = 1; $i -le 5; $i++) {
    # Generate random data
    $businessName = $businessNames | Get-Random
    $description = $descriptions | Get-Random
    $amount = Get-Random -Minimum 1000 -Maximum 50000
    $targetFund = Get-Random -Minimum 50000 -Maximum 500000
    $startDate = (Get-Date).AddDays((Get-Random -Minimum 30 -Maximum 365)).ToString("yyyy-MM-ddTHH:mm:ssZ")
    $businessStageId = Get-Random -Minimum 1 -Maximum 6  # 1-5
    $businessCategoryId = Get-Random -Minimum 100 -Maximum 103  # 100-102
    $projectPhaseId = Get-Random -Minimum 6 -Maximum 11  # 6-10
    $milestone = $milestones | Get-Random
    $riskLevel = @("Low", "Medium", "High") | Get-Random
    $currency = $currencies | Get-Random

    $investmentPayload = @{
        amount = $amount
        businessName = $businessName
        description = $description
        startDate = $startDate
        businessStageId = $businessStageId
        businessCategoryId = $businessCategoryId
        projectPhaseId = $projectPhaseId
        milestone = $milestone
        riskLevel = $riskLevel
        targetFund = $targetFund
        currency = $currency
    } | ConvertTo-Json

    Write-Host "`nCreating Investment $i..." -ForegroundColor Cyan
    Write-Host "Business: $businessName, Amount: $amount $currency, Target: $targetFund $currency" -ForegroundColor Gray

    try {
        $investmentResponse = Invoke-WebRequest -Uri "$baseUrl/api/v1/investments" -Method POST -Headers $headers -Body $investmentPayload -UseBasicParsing
        $investmentData = $investmentResponse.Content | ConvertFrom-Json

        if ($investmentData.success -eq $true) {
            Write-Host "Investment $i created successfully! ID: $($investmentData.data.id)" -ForegroundColor Green
        } else {
            Write-Host "Investment $i creation failed: $($investmentData.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Investment $i creation request failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorResponse = $reader.ReadToEnd()
            Write-Host "Error details: $errorResponse" -ForegroundColor Red
        }
    }
}

Write-Host "`nAll investments creation attempts completed!" -ForegroundColor Yellow
