param(
    [string]$BaseUrl = 'http://localhost:5000',
    [string]$Password = "P@ssw0rd",
    [int]$UserCount = 20
)

function Invoke-SignUp {
    param($phone, $password, $first, $last)
    $body = @{
        PhoneNumber = $phone
        Password = $password
        FirstName = $first
        LastName = $last
        FirebaseUid = ''
    } | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/auth/sign-up" -Body $body -ContentType 'application/json' -ErrorAction Stop
        return @{ success = $true; phone = $phone; response = $resp }
    }
    catch {
        return @{ success = $false; phone = $phone; error = $_.Exception.Message }
    }
}

function New-RandomEgyptianPhone {
    $prefixes = @('010','011','012','015')
    $prefix = Get-Random -InputObject $prefixes
    $rest = -join ((1..8) | ForEach-Object { Get-Random -Minimum 0 -Maximum 10 })
    return ($prefix + $rest)
}

function New-RandomName {
    $firstNames = @('Ahmed','Mohamed','Omar','Sara','Mona','Hassan','Fatma','Youssef','Khaled','Mai','Ali','Hussein','Ibrahim','Said','Naguib','Ismail','El-Sayed','Mahmoud','Farouk','Adel','Nour','Hana','Mostafa','Yara','Samir','Gamal','Fathy','Salma','Amr','Laila','Tarek','Dina','Karim','Rania','Sherif','Aya','Walid','Heba','Osama','Nadia','Bassam','Lina','Fadi','Samar','Ziad','Reem','Jamil','Huda','Raed','Maha')
    $lastNames = @('Ali','Hussein','Ibrahim','Said','Naguib','Ismail','El-Sayed','Mahmoud','Farouk','Adel','Hassan','Youssef','Khaled','Ahmed','Mohamed','Omar','Salem','Gamal','Fathy','Samir','Mostafa','Nour','Hana','Yara','Fatma','Sara','Mona','Mai','Dina','Laila','Tarek','Karim','Sherif','Walid','Osama','Bassam','Ziad','Jamil','Raed','Fadi')
    $first = Get-Random -InputObject $firstNames
    $last = Get-Random -InputObject $lastNames
    return @{ First = $first; Last = $last }
}

Write-Host "Creating $UserCount random user accounts..."
Write-Host "Using base URL: $BaseUrl"

$results = @()
$createdCount = 0

for ($i = 1; $i -le $UserCount; $i++) {
    $name = New-RandomName
    $phone = New-RandomEgyptianPhone
    Write-Host "Creating user #$i : ${phone} -> $($name.First) $($name.Last)"

    $r = Invoke-SignUp -phone $phone -password $Password -first $name.First -last $name.Last
    $results += $r

    if ($r.success) {
        Write-Host "Created: $($r.phone)" -ForegroundColor Green
        $createdCount++
    } else {
        Write-Host "Failed: $($r.phone) - $($r.error)" -ForegroundColor Red
    }

    Start-Sleep -Milliseconds 200
}

Write-Host "Summary: $createdCount out of $UserCount users created successfully."

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outFile = "create_random_users_${timestamp}_results.json"
$results | ConvertTo-Json -Depth 5 | Out-File -FilePath $outFile -Encoding UTF8

Write-Host "Results saved to $outFile"