param(
    [string]$BaseUrl = $env:BASE_URL,
    [string]$Password = "P@ssw0rd"
)

if (-not $BaseUrl) { $BaseUrl = 'http://localhost:5000' }

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
    # Egyptian mobile prefixes: 010,011,012,015
    $prefixes = @('010','011','012','015')
    $prefix = Get-Random -InputObject $prefixes
    $rest = -join ((1..8) | ForEach-Object { Get-Random -Minimum 0 -Maximum 10 })
    return ($prefix + $rest)
}

function New-RandomName {
    $first = @('Ahmed','Mohamed','Omar','Sara','Mona','Hassan','Fatma','Youssef','Khaled','Mai') | Get-Random
    $last = @('Ali','Hussein','Ibrahim','Said','Naguib','Ismail','El-Sayed','Mahmoud','Farouk','Adel') | Get-Random
    return @{ First = $first; Last = $last }
}

Write-Host "Using base URL: $BaseUrl"

$results = @()

# Create the specific user requested by the user
$given = @{ phone = '01022322292'; first = 'shady'; last = 'ismael' }
Write-Host "Creating account for $($given.phone) -> $($given.first) $($given.last)"
$r = Invoke-SignUp -phone $given.phone -password $Password -first $given.first -last $given.last
$results += $r
if ($r.success) { Write-Host "Created: $($r.phone)" } else { Write-Host "Failed: $($r.phone) - $($r.error)" }

Start-Sleep -Seconds 1

# Create 5 random accounts with same password
for ($i = 1; $i -le 5; $i++) {
    $name = New-RandomName
    $phone = New-RandomEgyptianPhone
    Write-Host "Creating random account #${i}: ${phone} -> $($name.First) $($name.Last)"
    $r = Invoke-SignUp -phone $phone -password $Password -first $name.First -last $name.Last
    $results += $r
    if ($r.success) { Write-Host "Created: $($r.phone)" } else { Write-Host "Failed: $($r.phone) - $($r.error)" }
    Start-Sleep -Milliseconds 500
}

# Save results to file
$outFile = Join-Path -Path (Split-Path -Parent $MyInvocation.MyCommand.Path) -ChildPath 'create_accounts_results.json'
$results | ConvertTo-Json -Depth 5 | Out-File -FilePath $outFile -Encoding UTF8

Write-Host "Done. Results saved to $outFile"
