param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $FlutterArgs
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$deviceId = 'emulator-5554'
$apiBaseUrl = 'http://10.0.2.2:5235/api/v1'
$flutterExitCode = 0
$mutex = [System.Threading.Mutex]::new($false, 'Local\FopxFounderAndroidRun')
$mutexAcquired = $false

try {
    try {
        $mutexAcquired = $mutex.WaitOne([TimeSpan]::FromMinutes(2))
    }
    catch [System.Threading.AbandonedMutexException] {
        # A prior launcher exited unexpectedly; this process now owns the lock.
        $mutexAcquired = $true
    }

    if (-not $mutexAcquired) {
        throw 'Another FOPX Android launch is still active. Wait for it to finish, then retry.'
    }

    if (-not (Test-Path (Join-Path $projectRoot 'pubspec.yaml')) -or
        -not (Test-Path (Join-Path $projectRoot 'android\gradle.properties'))) {
        throw "The Founder Flutter project was not found at $projectRoot. Use the current Flutter_Founder checkout, not the obsolete Flutter\_Founder path."
    }

    if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
        throw 'Flutter is not available on PATH. Open a terminal with the Flutter SDK configured, then retry.'
    }

    Push-Location $projectRoot
    try {
        Write-Host "Launching FOPX Founder from $projectRoot on $deviceId with the Development API."
        Write-Host 'This launcher serializes Android runs to prevent concurrent Gradle cache locks.'
        & flutter run --device-id $deviceId "--dart-define=FOPX_API_BASE_URL=$apiBaseUrl" @FlutterArgs
        $flutterExitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }
}
finally {
    if ($mutexAcquired) {
        $mutex.ReleaseMutex()
    }
    $mutex.Dispose()
}

exit $flutterExitCode
