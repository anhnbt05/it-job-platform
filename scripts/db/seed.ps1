param(
    [string]$Service
)

$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$servicesDir = Join-Path $rootDir "services"
$rootEnvFile = Join-Path $rootDir ".env"
$seedableServices = @(
    "organization-service",
    "identity-service",
    "notification-service",
    "job-service",
    "application-service"
)

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

function Invoke-NpmScript {
    param(
        [string]$TargetService,
        [string]$ScriptName
    )

    Write-Host ">>> [$TargetService] npm run $ScriptName"
    Push-Location (Join-Path $servicesDir $TargetService)
    try {
        npm run $ScriptName
        if ($LASTEXITCODE -ne 0) {
            throw "[$TargetService] npm run $ScriptName failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-MavenSeed {
    param(
        [string]$TargetService
    )

    $serviceDir = Join-Path $servicesDir $TargetService
    $mavenWrapper = Join-Path $serviceDir "mvnw.cmd"
    $mavenCommand = $null

    if (Test-Path $mavenWrapper) {
        $mavenCommand = $mavenWrapper
    }
    elseif (Get-Command mvn -ErrorAction SilentlyContinue) {
        $mavenCommand = "mvn"
    }
    else {
        throw "Maven is required to seed '$TargetService'. Install Maven or add a Maven wrapper."
    }

    Write-Host ">>> [$TargetService] seed via Spring Boot runner"
    Push-Location $serviceDir
    try {
        $previousSpringApplicationJson = $env:SPRING_APPLICATION_JSON
        $env:SPRING_APPLICATION_JSON = '{"app":{"seed":true},"spring":{"main":{"web-application-type":"none"},"kafka":{"listener":{"auto-startup":false}},"task":{"scheduling":{"enabled":false}}}}'
        & $mavenCommand -q -DskipTests spring-boot:run
        if ($LASTEXITCODE -ne 0) {
            throw "[$TargetService] Maven seed failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        $env:SPRING_APPLICATION_JSON = $previousSpringApplicationJson
        Pop-Location
    }
}

function Invoke-ServiceSeed {
    param(
        [string]$TargetService
    )

    switch ($TargetService) {
        "organization-service" {
            Invoke-NpmScript $TargetService "migration:run"
            Invoke-NpmScript $TargetService "db:seed"
        }
        "identity-service" {
            Invoke-NpmScript $TargetService "prisma:generate"
            Invoke-NpmScript $TargetService "prisma:deploy"
            Invoke-NpmScript $TargetService "db:seed"
        }
        "notification-service" {
            Invoke-NpmScript $TargetService "migration:run"
            Invoke-NpmScript $TargetService "db:seed"
        }
        "job-service" {
            Invoke-MavenSeed $TargetService
        }
        "application-service" {
            Invoke-MavenSeed $TargetService
        }
        default {
            throw "'$TargetService' is not a supported seed target."
        }
    }
}

Import-EnvFile -Path $rootEnvFile

& (Join-Path $rootDir "scripts\dev\sync-db-passwords.ps1")
if ($LASTEXITCODE -ne 0) {
    throw "Database credential sync failed with exit code $LASTEXITCODE."
}

if ($Service) {
    Invoke-ServiceSeed $Service
    exit 0
}

Write-Host "=== Running migrate + seed for supported services ==="
foreach ($targetService in $seedableServices) {
    Invoke-ServiceSeed $targetService
}
Write-Host "=== Seed done ==="
