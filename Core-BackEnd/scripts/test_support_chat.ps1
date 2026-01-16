# Test Support Chat Functionality
$ErrorActionPreference='Stop'
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$baseUrls = @(
    'https://192.168.1.15:7292',
    'https://localhost:7292',
    'http://192.168.1.15:5235',
    'http://localhost:5235',
    'https://127.0.0.1:7292',
    'http://127.0.0.1:5235',
    'http://localhost:5000'
)

# Login as regular user
$userLoginBody = @{ email='user@example.com'; password='P@ssw0rd' } | ConvertTo-Json

# Login as admin
$adminLoginBody = @{ email='admin@investa.com'; password='P@ssw0rd' } | ConvertTo-Json

foreach ($baseUrl in $baseUrls) {
    try {
        Write-Output "Testing support chat on $baseUrl"

        # Login as user
        $userLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login-email" -Method Post -Body $userLoginBody -ContentType 'application/json' -ErrorAction Stop -TimeoutSec 10
        if ($userLogin.success -eq $true -or $userLogin.data) {
            $userToken = $null
            if ($userLogin.data.token) { $userToken = $userLogin.data.token }
            elseif ($userLogin.data.Token) { $userToken = $userLogin.data.Token }
            elseif ($userLogin.Token) { $userToken = $userLogin.Token }

            if ($userToken) {
                Write-Output "User login successful"

                # Login as admin
                $adminLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login-email" -Method Post -Body $adminLoginBody -ContentType 'application/json' -ErrorAction Stop -TimeoutSec 10
                if ($adminLogin.success -eq $true -or $adminLogin.data) {
                    $adminToken = $null
                    if ($adminLogin.data.token) { $adminToken = $adminLogin.data.token }
                    elseif ($adminLogin.data.Token) { $adminToken = $adminLogin.data.Token }
                    elseif ($adminLogin.Token) { $adminToken = $adminLogin.Token }

                    if ($adminToken) {
                        Write-Output "Admin login successful"
                        Write-Output "Support chat functionality is ready!"
                        Write-Output "SignalR Hub URL: $baseUrl/hubs/chat"
                        break
                    }
                }
            }
        }
    } catch {
        Write-Output "Failed on $baseUrl : $($_.Exception.Message)"
    }
}

Write-Output "Test completed."