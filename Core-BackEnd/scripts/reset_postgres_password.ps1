Param(
    [string]$ContainerName = "investa-postgres",
    [string]$AppUser = "investa_user",
    [string]$NewPassword = "ChangeMe",
    [string]$PostgresSuperUser = "postgres"
)

function Write-Info($m) { Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Err($m) { Write-Host "[ERROR] $m" -ForegroundColor Red }

Write-Info "Attempting to reset password for user '$AppUser' to the provided value."

# Try Docker path first
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    Write-Info "Docker detected. Checking for container '$ContainerName'..."
    $cont = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" | Select-Object -First 1
    if ($cont) {
        Write-Info "Found container '$cont'. Running ALTER USER inside container..."
        $sql = "ALTER USER $AppUser WITH PASSWORD '$NewPassword';"
        try {
            docker exec -i $cont psql -U $PostgresSuperUser -d postgres -c "$sql"
            if ($LASTEXITCODE -eq 0) {
                Write-Info "Password reset succeeded inside container '$cont'. Restarting container..."
                docker restart $cont | Out-Null
                Write-Info "Container restarted. Test connection with: psql -h localhost -U $AppUser -d InvestaDb"
                return
            } else {
                Write-Err "Command returned non-zero exit code. See docker logs for details."
            }
        } catch {
            Write-Err "Failed to exec into container: $_"
        }
    } else {
        Write-Err "No container named '$ContainerName' found."
    }
} else {
    Write-Err "Docker CLI not found on PATH. Skipping Docker path."
}

# Try local psql next
$psql = Get-Command psql -ErrorAction SilentlyContinue
if ($psql) {
    Write-Info "psql detected. Attempting to connect as superuser '$PostgresSuperUser' to alter password..."
    try {
        $env:PGPASSWORD = Read-Host -AsSecureString "Enter password for superuser '$PostgresSuperUser' (will be used for this session)" | 
            ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
        $sql = "ALTER USER $AppUser WITH PASSWORD '$NewPassword';"
        & psql -h localhost -U $PostgresSuperUser -d postgres -c "$sql"
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Password reset succeeded locally. Test connection with: psql -h localhost -U $AppUser -d InvestaDb"
            return
        } else {
            Write-Err "psql returned non-zero exit code. Check that the superuser password is correct and that the server is reachable."
        }
    } catch {
        Write-Err "Local psql attempt failed: $_"
    } finally {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
} else {
    Write-Err "psql not found on PATH."
}

Write-Err "Automatic password reset failed. Suggested manual steps:"
Write-Host "- If using Docker with a data volume, run: docker exec -it <container> psql -U postgres -d postgres -c \"ALTER USER $AppUser WITH PASSWORD '$NewPassword';\"" -ForegroundColor Yellow
Write-Host "- If local Postgres, run: psql -h localhost -U postgres -d postgres; ALTER USER $AppUser WITH PASSWORD '$NewPassword';" -ForegroundColor Yellow
