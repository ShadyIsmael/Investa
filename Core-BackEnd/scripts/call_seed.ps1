[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
try {
	$r = Invoke-WebRequest -Uri 'https://DESKTOP-DIH7CQH:7292/api/v1/lookups/business-stages' -Method GET -UseBasicParsing -ErrorAction Stop
	if ($r -ne $null) {
		if ($r.StatusCode) { Write-Output $r.StatusCode.Value__ }
		if ($r.Content) { Write-Output $r.Content }
	} else {
		Write-Output 'No response object returned.'
	}
} catch {
	Write-Output $_.ToString()
} finally {
	[System.Net.ServicePointManager]::ServerCertificateValidationCallback = $null
}
