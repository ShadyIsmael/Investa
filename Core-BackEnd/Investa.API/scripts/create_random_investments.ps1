# Create 20 random investments script
$baseUrl = 'https://192.168.1.15:7292'
# allow self-signed certs for local dev
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

# wait for API
for ($i=0; $i -lt 10; $i++) {
    try { Invoke-RestMethod -Method Get -Uri "$baseUrl/health" -ErrorAction Stop | Out-Null; Write-Host 'API UP'; break } catch { Start-Sleep -Seconds 1 }
}

# login
$loginBody = @{ phoneNumber = '01022322292'; password = 'P@ssw0rd' } | ConvertTo-Json
try {
    $login = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -Body $loginBody -ContentType 'application/json' -ErrorAction Stop
    Write-Host "LOGIN_OK"
    $token = $login.data.token
} catch {
    Write-Host "LOGIN_FAIL: $($_.Exception.Message)"; exit 1
}

$headers = @{ Authorization = "Bearer $token" }
$categories = @(100,101,102,110,115)
$riskLevels = @('Low','Medium','High')

for ($n=1; $n -le 20; $n++) {
    $amount = [math]::Round((Get-Random -Minimum 100 -Maximum 10000) + (Get-Random -Minimum 0 -Maximum 99)/100,2)
    $targetFund = [math]::Round($amount * (Get-Random -Minimum 3 -Maximum 30),2)
    $businessName = "Auto Test $([guid]::NewGuid().ToString().Substring(0,8))"
    $bodyObj = @{ 
        amount = $amount;
        businessName = $businessName;
        description = 'Auto-generated';
        startDate = (Get-Date).ToString('o');
        businessStageId = (Get-Random -Minimum 1 -Maximum 5);
        businessCategoryId = $categories[(Get-Random -Minimum 0 -Maximum ($categories.Length-1))];
        projectPhaseId = $null;
        milestone = ('M' + (Get-Random -Minimum 1 -Maximum 10));
        riskLevel = $riskLevels[(Get-Random -Minimum 0 -Maximum ($riskLevels.Length-1))];
        targetFund = $targetFund;
        currency = 'EGP'
    }
    $body = $bodyObj | ConvertTo-Json -Depth 5
    try {
        $resp = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/v1/investments" -Headers $headers -Body $body -ContentType 'application/json' -ErrorAction Stop
        Write-Host "CREATED $n - Id: $($resp.data.id)"
    } catch {
        Write-Host "CREATE_FAIL $n - $($_.Exception.Message)"
    }
    Start-Sleep -Milliseconds 200
}
Write-Host 'Done'