$response = Invoke-RestMethod -Uri "http://10.245.142.220:5235/api/auth/login" -Method POST -ContentType "application/json" -Body '{"phoneNumber":"+2001022322292","password":"P@ssw0rd"}' -UseBasicParsing
Write-Host "Success: $($response.success)"
Write-Host "Role: $($response.data.role)"
Write-Host "UserType: $($response.data.userType)"