param(
    [string]$BaseUrl = 'http://localhost:5000'
)

Write-Host "Using base URL: $BaseUrl"

function PostJson($uri,$obj){ return Invoke-RestMethod -Method Post -Uri $uri -Body ($obj|ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop }

$email = "admin+" + (Get-Random -Maximum 100000) + "@local.test"
$pass = "P@ssw0rdAdmin!"

try{
    $create = PostJson "$BaseUrl/api/auth/create-admin" @{ Email=$email; Password=$pass; FirstName='Script'; LastName='Admin' }
    Write-Host "create-admin:" ($create | ConvertTo-Json -Depth 2)
} catch { Write-Host "create-admin failed:" $_.Exception.Message }

try{
    $login = PostJson "$BaseUrl/api/auth/login-email" @{ Email=$email; Password=$pass }
    $token = $login.data.token
    if (-not $token) { Write-Error 'no token returned'; exit 1 }
    Write-Host "admin token obtained"
    Write-Host "TOKEN:$token"
} catch { Write-Host "login failed:" $_.Exception.Message; exit 1 }

try{
    $headers = @{ Authorization = "Bearer $token" }
    # use curl.exe to get raw status and body
    $tmp = Join-Path $env:TEMP ("admin_clients_" + (Get-Random) + ".json")
    $code = & curl.exe -s -o $tmp -w "%{http_code}" -X GET "$BaseUrl/api/v1/admin/clients" -H "Authorization: Bearer $token"
    Write-Host "HTTP:" $code
    Write-Host "Body:"; Get-Content $tmp -Raw
    Remove-Item $tmp -ErrorAction SilentlyContinue
} catch {
    if ($_.Exception.Response) {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP:" $code
        try { $b = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd(); Write-Host "Body:"; Write-Host $b } catch {}
    } else { Write-Host 'call failed:' $_.Exception.Message }
}

Write-Host "Done"
