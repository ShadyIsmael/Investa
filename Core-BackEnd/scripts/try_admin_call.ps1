$ErrorActionPreference='Stop'
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

Write-Output '== Process check =='
try {
    $procs = Get-WmiObject Win32_Process | Where-Object { $_.CommandLine -match 'Investa.API' -or $_.CommandLine -match 'Investa.API.dll' -or $_.CommandLine -match 'Investa.API.exe' -or $_.CommandLine -match 'dotnet.*Investa.API' }
    if ($procs) {
        $procs | Select-Object ProcessId, CommandLine | Format-List
    } else {
        Write-Output 'No matching processes found.'
    }
} catch {
    Write-Output 'Process query failed: ' + $_.Exception.Message
}

Write-Output '== Netstat =='
try {
    netstat -ano | findstr 7292 5235 62762 44375
} catch {
    Write-Output 'netstat/findstr failed'
}

$baseUrls = @(
    'https://192.168.1.15:7292',
    'https://localhost:7292',
    'http://192.168.1.15:5235',
    'http://localhost:5235',
    'https://127.0.0.1:7292',
    'http://127.0.0.1:5235'
)

$body = @{ email='admin@investa.com'; password='P@ssw0rd' } | ConvertTo-Json

foreach ($b in $baseUrls) {
    try {
        Write-Output "Trying $b/api/auth/login-email"
        $login = Invoke-RestMethod -Uri "$b/api/auth/login-email" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop -TimeoutSec 15
        if ($login) {
            Write-Output "Login succeeded on $b"
            $token = $null
            if ($null -ne $login.data) { $token = $login.data.token }
            if (-not $token -and $null -ne $login.data) { $token = $login.data.Token }
            if (-not $token -and $login.Token) { $token = $login.Token }
            Write-Output '--- LOGIN RESPONSE ---'
            $login | ConvertTo-Json -Depth 5
            Write-Output '--- TOKEN ---'
            Write-Output $token
            if ($token) {
                $hdr = @{ Authorization = "Bearer $token" }
                Write-Output "Calling $b/api/v1/admin/clients/top"
                $top = Invoke-RestMethod -Uri "$b/api/v1/admin/clients/top" -Headers $hdr -Method Get -ErrorAction Stop -TimeoutSec 15
                Write-Output '--- ADMIN TOP RESPONSE ---'
                $top | ConvertTo-Json -Depth 5
            }
            break
        }
    } catch {
        Write-Output ('Attempt failed on ' + $b + ': ' + $_.Exception.Message)
    }
}

Write-Output 'Done.'
