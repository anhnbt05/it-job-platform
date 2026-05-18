param(
    [switch]$ForceBuild,
    [switch]$SkipSeed,
    [switch]$SkipObservability,
    [switch]$SkipFrontend
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$infraComposeFile = Join-Path $rootDir "docker-compose.yml"
$appComposeFile = Join-Path $rootDir "docker-compose.app.yml"
$seedScript = Join-Path $rootDir "scripts\db\seed.ps1"
$syncDbPasswordsScript = Join-Path $rootDir "scripts\dev\sync-db-passwords.ps1"
$rootEnvFile = Join-Path $rootDir ".env"
$frontendDir = Join-Path (Split-Path -Parent $rootDir) "it-job-platform-fe"

function Import-EnvFile {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        return
    }

    foreach ($line in Get-Content $Path) {
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith("#")) {
            continue
        }

        $separatorIndex = $trimmed.IndexOf("=")
        if ($separatorIndex -lt 1) {
            continue
        }

        $name = $trimmed.Substring(0, $separatorIndex).Trim()
        $value = $trimmed.Substring($separatorIndex + 1).Trim()

        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        Set-Item -Path "Env:$name" -Value $value
    }
}

function Get-EnvValue {
    param(
        [string]$Name,
        [string]$Default
    )

    $value = [Environment]::GetEnvironmentVariable($Name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $Default
    }

    return $value
}

Import-EnvFile -Path $rootEnvFile

$identityPostgresPort = [int](Get-EnvValue -Name "IDENTITY_POSTGRES_PORT" -Default "5432")
$jobPostgresPort = [int](Get-EnvValue -Name "JOB_POSTGRES_PORT" -Default "5433")
$notificationPostgresPort = [int](Get-EnvValue -Name "NOTIFICATION_POSTGRES_PORT" -Default "5434")
$organizationMysqlPort = [int](Get-EnvValue -Name "ORGANIZATION_MYSQL_PORT" -Default "3306")
$applicationMongoPort = [int](Get-EnvValue -Name "APPLICATION_MONGO_PORT" -Default "27018")
$redisPort = [int](Get-EnvValue -Name "REDIS_PORT" -Default "6379")
$kafkaExternalPort = [int](Get-EnvValue -Name "KAFKA_EXTERNAL_PORT" -Default "29092")
$kongProxyPort = [int](Get-EnvValue -Name "KONG_PROXY_PORT" -Default "8000")
$identityServicePort = [int](Get-EnvValue -Name "IDENTITY_SERVICE_PORT" -Default "3001")
$organizationServicePort = [int](Get-EnvValue -Name "ORGANIZATION_SERVICE_PORT" -Default "3002")
$notificationServicePort = [int](Get-EnvValue -Name "NOTIFICATION_SERVICE_PORT" -Default "3003")
$jobServicePort = [int](Get-EnvValue -Name "JOB_SERVICE_PORT" -Default "8082")
$applicationServicePort = [int](Get-EnvValue -Name "APPLICATION_SERVICE_PORT" -Default "8083")
$dashboardServicePort = [int](Get-EnvValue -Name "DASHBOARD_SERVICE_PORT" -Default "8084")
$frontendPort = [int](Get-EnvValue -Name "FRONTEND_PORT" -Default "3000")

$infraServices = @(
    "identity-postgres",
    "job-postgres",
    "notification-postgres",
    "organization-mysql",
    "application-mongo",
    "redis",
    "kafka",
    "kafka-ui",
    "kong"
)

$observabilityServices = @(
    "prometheus",
    "loki",
    "promtail",
    "grafana",
    "jaeger"
)

$appServices = @(
    "identity-service",
    "organization-service",
    "notification-service",
    "job-service",
    "application-service",
    "dashboard-service",
    "frontend"
)

$appImageNames = @{
    "identity-service" = "it-job-platform-identity-service"
    "organization-service" = "it-job-platform-organization-service"
    "notification-service" = "it-job-platform-notification-service"
    "job-service" = "it-job-platform-job-service"
    "application-service" = "it-job-platform-application-service"
    "dashboard-service" = "it-job-platform-dashboard-service"
    "frontend" = "it-job-platform-frontend"
}

$infraWaitTargets = @(
    @{ Name = "identity-postgres"; Address = "127.0.0.1"; Port = $identityPostgresPort },
    @{ Name = "job-postgres"; Address = "127.0.0.1"; Port = $jobPostgresPort },
    @{ Name = "notification-postgres"; Address = "127.0.0.1"; Port = $notificationPostgresPort },
    @{ Name = "organization-mysql"; Address = "127.0.0.1"; Port = $organizationMysqlPort },
    @{ Name = "application-mongo"; Address = "127.0.0.1"; Port = $applicationMongoPort },
    @{ Name = "redis"; Address = "127.0.0.1"; Port = $redisPort },
    @{ Name = "kafka-external"; Address = "127.0.0.1"; Port = $kafkaExternalPort },
    @{ Name = "kong"; Address = "127.0.0.1"; Port = $kongProxyPort }
)

$healthChecks = @(
    @{ Name = "identity-service"; Url = "http://127.0.0.1:$identityServicePort/health" },
    @{ Name = "organization-service"; Url = "http://127.0.0.1:$organizationServicePort/health" },
    @{ Name = "notification-service"; Url = "http://127.0.0.1:$notificationServicePort/health" },
    @{ Name = "job-service"; Url = "http://127.0.0.1:$jobServicePort/api/health" },
    @{ Name = "application-service"; Url = "http://127.0.0.1:$applicationServicePort/api/health" },
    @{ Name = "dashboard-service"; Url = "http://127.0.0.1:$dashboardServicePort/api/health" },
    @{ Name = "kong"; Url = "http://127.0.0.1:$kongProxyPort/identity/health" },
    @{ Name = "frontend"; Url = "http://127.0.0.1:$frontendPort" }
)

function Invoke-Docker {
    param(
        [string[]]$CommandArgs,
        [switch]$AllowFailure
    )

    & docker @CommandArgs
    if (-not $AllowFailure -and $LASTEXITCODE -ne 0) {
        throw "Docker command failed with exit code ${LASTEXITCODE}: docker $($CommandArgs -join ' ')"
    }
}

function Test-DockerImageExists {
    param(
        [string]$ImageName
    )

    & docker image inspect $ImageName *> $null
    return $LASTEXITCODE -eq 0
}

function Wait-TcpPort {
    param(
        [string]$Name,
        [string]$Address,
        [int]$Port,
        [int]$TimeoutSeconds = 120
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $client = $null
        try {
            $client = [System.Net.Sockets.TcpClient]::new()
            $asyncResult = $client.BeginConnect($Address, $Port, $null, $null)
            if ($asyncResult.AsyncWaitHandle.WaitOne(1000) -and $client.Connected) {
                $client.EndConnect($asyncResult)
                $client.Close()
                Write-Host ">>> [$Name] $Address`:$Port is ready"
                return
            }
        }
        catch {
        }
        finally {
            if ($null -ne $client) {
                $client.Dispose()
            }
        }

        Start-Sleep -Seconds 2
    }

    throw "Timed out waiting for $Name on $Address`:$Port."
}

function Wait-HttpOk {
    param(
        [string]$Name,
        [string]$Url,
        [int]$TimeoutSeconds = 120
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                Write-Host ">>> [$Name] $Url is responding ($($response.StatusCode))"
                return
            }
        }
        catch {
        }

        Start-Sleep -Seconds 3
    }

    throw "Timed out waiting for $Name at $Url."
}

function Wait-KafkaBrokerReady {
    param(
        [int]$TimeoutSeconds = 180
    )

    Write-Host ">>> [kafka] waiting for broker warmup"
    Start-Sleep -Seconds 20

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $probeCommand = "docker compose -f ""$infraComposeFile"" exec -T kafka kafka-topics --bootstrap-server kafka:9092 --list >nul 2>nul"
        & cmd.exe /d /c $probeCommand
        if ($LASTEXITCODE -eq 0) {
            Write-Host ">>> [kafka] broker is ready for admin operations"
            return
        }

        Start-Sleep -Seconds 3
    }

    throw "Timed out waiting for Kafka broker admin readiness."
}

function Build-AppImagesIfNeeded {
    param(
        [string[]]$TargetServices
    )

    $missingServices = @()
    foreach ($service in $TargetServices) {
        if (-not $appImageNames.ContainsKey($service)) {
            continue
        }

        if (-not (Test-DockerImageExists -ImageName $appImageNames[$service])) {
            $missingServices += $service
        }
    }

    if ($ForceBuild -or $missingServices.Count -gt 0) {
        if ($ForceBuild) {
            Write-Host "=== Building app images (forced) ==="
            Invoke-Docker -CommandArgs (@("compose", "-f", $infraComposeFile, "-f", $appComposeFile, "build") + $TargetServices)
            return
        }

        Write-Host "=== Building missing app images ==="
        Invoke-Docker -CommandArgs (@("compose", "-f", $infraComposeFile, "-f", $appComposeFile, "build") + $missingServices)
        return
    }

    Write-Host "=== App images already exist. Skip build ==="
}

function Start-InfraStack {
    Write-Host "=== Starting infrastructure ==="
    Invoke-Docker -CommandArgs (@("compose", "-f", $infraComposeFile, "up", "-d") + $infraServices)

    if (-not $SkipObservability) {
        Write-Host "=== Starting observability ==="
        Invoke-Docker -CommandArgs (@("compose", "-f", $infraComposeFile, "up", "-d") + $observabilityServices)
    }

    foreach ($target in $infraWaitTargets) {
        Wait-TcpPort -Name $target.Name -Address $target.Address -Port $target.Port
    }
}

function Initialize-KafkaTopics {
    Write-Host "=== Creating Kafka topics ==="
    Wait-KafkaBrokerReady
    Invoke-Docker -CommandArgs @("compose", "-f", $infraComposeFile, "rm", "-f", "kafka-init") -AllowFailure
    Invoke-Docker -CommandArgs @("compose", "-f", $infraComposeFile, "run", "--rm", "--no-deps", "kafka-init")
}

function Sync-DatabaseCredentials {
    if (-not (Test-Path $syncDbPasswordsScript)) {
        throw "Sync script not found: $syncDbPasswordsScript"
    }

    Write-Host "=== Syncing persisted database credentials ==="
    & $syncDbPasswordsScript
    if ($LASTEXITCODE -ne 0) {
        throw "Database credential sync failed with exit code $LASTEXITCODE."
    }
}

function Run-Seeds {
    if ($SkipSeed) {
        Write-Host "=== Skip seed ==="
        return
    }

    if (-not (Test-Path $seedScript)) {
        throw "Seed script not found: $seedScript"
    }

    Write-Host "=== Running database migrations and seeds ==="
    & $seedScript
    if ($LASTEXITCODE -ne 0) {
        throw "Seed script failed with exit code $LASTEXITCODE."
    }
}

function Start-AppStack {
    param(
        [string[]]$TargetServices
    )

    Write-Host "=== Starting application stack ==="
    Invoke-Docker -CommandArgs (@("compose", "-f", $infraComposeFile, "-f", $appComposeFile, "up", "-d") + $TargetServices)
}

function Wait-ApplicationHealth {
    param(
        [bool]$IncludeFrontend
    )

    foreach ($check in $healthChecks) {
        if (-not $IncludeFrontend -and $check.Name -eq "frontend") {
            continue
        }

        Wait-HttpOk -Name $check.Name -Url $check.Url
    }
}

if (-not (Test-Path $infraComposeFile)) {
    throw "Compose file not found: $infraComposeFile"
}

if (-not (Test-Path $appComposeFile)) {
    throw "Compose app file not found: $appComposeFile"
}

if (-not $SkipFrontend -and -not (Test-Path $frontendDir)) {
    throw "Frontend repository not found: $frontendDir"
}

$servicesToBuild = $appServices
$servicesToRun = $appServices

if ($SkipFrontend) {
    $servicesToBuild = $servicesToBuild | Where-Object { $_ -ne "frontend" }
    $servicesToRun = $servicesToRun | Where-Object { $_ -ne "frontend" }
}

Write-Host "=== IT Job Platform demo bootstrap ==="
Write-Host "Root: $rootDir"
Write-Host "Build apps: $($servicesToBuild -join ', ')"
Write-Host "Run apps: $($servicesToRun -join ', ')"

Push-Location $rootDir
try {
    Build-AppImagesIfNeeded -TargetServices $servicesToBuild
    Start-InfraStack
    Sync-DatabaseCredentials
    Initialize-KafkaTopics
    Run-Seeds
    Start-AppStack -TargetServices $servicesToRun
    Wait-ApplicationHealth -IncludeFrontend (-not $SkipFrontend)

    Write-Host ""
    Write-Host "=== Demo stack is ready ==="
    Write-Host "Frontend: http://localhost:$frontendPort"
    Write-Host "Kong: http://localhost:$kongProxyPort"
    Write-Host "Kafka UI: http://localhost:$(Get-EnvValue -Name 'KAFKA_UI_PORT' -Default '8080')"
    Write-Host "Grafana: http://localhost:$(Get-EnvValue -Name 'GRAFANA_PORT' -Default '3005') ($(Get-EnvValue -Name 'GRAFANA_ADMIN_USER' -Default 'admin')/$(Get-EnvValue -Name 'GRAFANA_ADMIN_PASSWORD' -Default 'admin'))"
    Write-Host "Jaeger: http://localhost:$(Get-EnvValue -Name 'JAEGER_UI_PORT' -Default '16686')"
}
finally {
    Pop-Location
}
