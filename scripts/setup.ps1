[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

function Write-Step {
    param([Parameter(Mandatory = $true)][string]$Message)

    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Stop-Setup {
    param([Parameter(Mandatory = $true)][string]$Message)

    Write-Host "`nSetup stopped: $Message" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Stop-Setup "Docker is not installed. Install and start Docker Desktop, then rerun this script."
}

$composeExecutable = $null
$composePrefix = @()

& docker compose version *> $null
if ($LASTEXITCODE -eq 0) {
    $composeExecutable = "docker"
    $composePrefix = @("compose")
} elseif (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    $composeExecutable = "docker-compose"
} else {
    Stop-Setup "Docker Compose was not found. Enable the Compose plugin in Docker Desktop."
}

& docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Stop-Setup "Docker Desktop is not running or this terminal cannot access its engine."
}

function Invoke-Compose {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$CommandArguments
    )

    & $composeExecutable @composePrefix @CommandArguments
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed: $($CommandArguments -join ' ')"
    }
}

function Test-ExpectedPort {
    param(
        [Parameter(Mandatory = $true)][int]$Port,
        [Parameter(Mandatory = $true)][string]$ExpectedContainer
    )

    $listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
    if (-not $listener) {
        return
    }

    $runningContainers = & docker ps --format "{{.Names}}"
    if ($runningContainers -notcontains $ExpectedContainer) {
        Stop-Setup "Port $Port is already in use. Stop the conflicting application and rerun setup."
    }
}

Write-Step "Checking development ports"
Test-ExpectedPort -Port 5173 -ExpectedContainer "budget_tracker_client"
Test-ExpectedPort -Port 8080 -ExpectedContainer "budget_tracker_api_nginx"

$apiEnvCreated = $false

Write-Step "Preparing local environment files"
if (-not (Test-Path "api/.env")) {
    Copy-Item "api/.env.example" "api/.env"
    $apiEnvCreated = $true
    Write-Host "Created api/.env"
} else {
    Write-Host "Preserving existing api/.env"
}

if (-not (Test-Path "client/.env")) {
    Copy-Item "client/.env.example" "client/.env"
    Write-Host "Created client/.env"
} else {
    Write-Host "Preserving existing client/.env"
}

$apiEnv = Get-Content "api/.env"
$needsAppKey = $apiEnvCreated -or ($apiEnv -match '^APP_KEY=\s*$')

try {
    Write-Step "Building Docker images (the first build may take several minutes)"
    Invoke-Compose -CommandArguments @("build")

    Write-Step "Installing Laravel dependencies inside Docker"
    Invoke-Compose -CommandArguments @("run", "--rm", "api", "composer", "install", "--no-interaction", "--prefer-dist")

    Write-Step "Installing exact client dependencies from package-lock.json"
    Invoke-Compose -CommandArguments @("run", "--rm", "client", "npm", "ci")

    Write-Step "Starting the application stack"
    Invoke-Compose -CommandArguments @("up", "-d", "--remove-orphans")

    if ($needsAppKey) {
        Write-Step "Generating the Laravel application key"
        Invoke-Compose -CommandArguments @("exec", "-T", "api", "php", "artisan", "key:generate", "--force")
    } else {
        Write-Host "`nPreserving the existing Laravel application key"
    }

    Write-Step "Running database migrations and development seeders"
    Invoke-Compose -CommandArguments @("exec", "-T", "api", "php", "artisan", "migrate", "--seed", "--force")

    Write-Step "Waiting for the client and API"
    $deadline = (Get-Date).AddMinutes(2)
    $clientReady = $false
    $apiReady = $false

    while ((Get-Date) -lt $deadline -and (-not $clientReady -or -not $apiReady)) {
        try {
            $null = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:5173" -TimeoutSec 5
            $clientReady = $true
        } catch {
            $clientReady = $false
        }

        try {
            $health = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -TimeoutSec 5
            $apiReady = $health.status -eq "ok"
        } catch {
            $apiReady = $false
        }

        if (-not $clientReady -or -not $apiReady) {
            Start-Sleep -Seconds 3
        }
    }

    if (-not $clientReady -or -not $apiReady) {
        Invoke-Compose -CommandArguments @("ps")
        Stop-Setup "The containers started, but the client or API did not become ready. Run the log commands shown in docs/SETUP.md."
    }

    Write-Step "Setup complete"
    Invoke-Compose -CommandArguments @("ps")

    Write-Host "`nClient:     http://localhost:5173" -ForegroundColor Green
    Write-Host "Laravel:    http://localhost:8080" -ForegroundColor Green
    Write-Host "API health: http://localhost:8080/api/v1/health" -ForegroundColor Green
    Write-Host "`nDevelopment account: test@example.com / password"
    Write-Host "`nDaily start: $composeExecutable $($composePrefix -join ' ') up -d"
    Write-Host "Daily stop:  $composeExecutable $($composePrefix -join ' ') down"
} catch {
    Stop-Setup $_.Exception.Message
}
