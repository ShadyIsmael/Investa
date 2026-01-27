# Test Group Creation API
$ErrorActionPreference='Stop'
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$baseUrls = @(
    'https://DESKTOP-DIH7CQH:7292',
    'https://localhost:7292',
    'http://DESKTOP-DIH7CQH:5235',
    'http://localhost:5235',
    'https://127.0.0.1:7292',
    'http://127.0.0.1:5235',
    'http://localhost:5000'
)

# Login as admin
$loginBody = @{ email='admin@investa.com'; password='P@ssw0rd' } | ConvertTo-Json

foreach ($baseUrl in $baseUrls) {
    try {
        Write-Output "Trying to login at $baseUrl/api/auth/login-email"
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login-email" -Method Post -Body $loginBody -ContentType 'application/json' -ErrorAction Stop -TimeoutSec 10

        if ($loginResponse.success -eq $true -or $loginResponse.data) {
            Write-Output "Login successful at $baseUrl"

            # Extract token
            $token = $null
            if ($loginResponse.data.token) { $token = $loginResponse.data.token }
            elseif ($loginResponse.data.Token) { $token = $loginResponse.data.Token }
            elseif ($loginResponse.Token) { $token = $loginResponse.Token }

            if ($token) {
                Write-Output "Got token: $($token.Substring(0,20))..."

                $headers = @{ Authorization = "Bearer $token" }

                # Test creating a group (name and description only)
                $groupBody = @{
                    name = "Test Managers"
                    description = "A test group for managers"
                } | ConvertTo-Json

                Write-Output "Creating group at $baseUrl/api/v1/admin/groups"
                $createResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/groups" -Method Post -Headers $headers -Body $groupBody -ContentType 'application/json' -ErrorAction Stop -TimeoutSec 10

                Write-Output "Group creation response:"
                $createResponse | ConvertTo-Json -Depth 5

                # Test getting all groups
                Write-Output "Getting all groups at $baseUrl/api/v1/admin/groups"
                $groupsResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/groups" -Method Get -Headers $headers -ErrorAction Stop -TimeoutSec 10

                Write-Output "Groups list:"
                $groupsResponse | ConvertTo-Json -Depth 5

                # Test getting the specific group by ID to see permissions
                $newGroupId = ($groupsResponse | Where-Object { $_.name -eq "Test Managers With Permissions" }).id
                if ($newGroupId) {
                    Write-Output "Getting group by ID $newGroupId at $baseUrl/api/v1/admin/groups/$newGroupId"
                    $groupDetailsResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/admin/groups/$newGroupId" -Method Get -Headers $headers -ErrorAction Stop -TimeoutSec 10
                    Write-Output "Group details:"
                    $groupDetailsResponse | ConvertTo-Json -Depth 5
                }

                break
            }
        }
    } catch {
        Write-Output "Failed at $baseUrl : $($_.Exception.Message)"
    }
}

Write-Output "Test completed."