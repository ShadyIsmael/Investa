$token = (Invoke-RestMethod -Uri "http://10.245.142.220:5235/api/auth/login" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"+2001022322292","password":"P@ssw0rd"}' -UseBasicParsing).data.token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$response = Invoke-RestMethod -Uri "http://10.245.142.220:5235/api/credits/2ffd2cbf-1de1-4727-abc2-39eaada58af5" -Method GET -Headers $headers -UseBasicParsing
$total = ($response | Measure-Object -Property amount -Sum).Sum
Write-Host "Total Credit Balance: $total"