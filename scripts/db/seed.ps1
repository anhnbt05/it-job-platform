param(
    [string]$Service
)

$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$servicesDir = Join-Path $rootDir "services"
$seedableServices = @(
    "organization-service",
    "identity-service",
    "notification-service",
    "job-service",
    "application-service"
)

function Invoke-NpmScript {
    param(
        [string]$TargetService,
        [string]$ScriptName
    )

    Write-Host ">>> [$TargetService] npm run $ScriptName"
    Push-Location (Join-Path $servicesDir $TargetService)
    try {
        npm run $ScriptName
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

if ($Service) {
    Invoke-ServiceSeed $Service
    exit 0
}

Write-Host "=== Running migrate + seed for supported services ==="
foreach ($targetService in $seedableServices) {
    Invoke-ServiceSeed $targetService
}
Write-Host "=== Seed done ==="
