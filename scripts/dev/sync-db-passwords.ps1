param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$rootEnvFile = Join-Path $rootDir ".env"

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

function Invoke-Docker {
    param(
        [string[]]$CommandArgs
    )

    & docker @CommandArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Docker command failed with exit code ${LASTEXITCODE}: docker $($CommandArgs -join ' ')"
    }
}

function Sync-PostgresPassword {
    param(
        [string]$Container,
        [string]$UserName,
        [string]$Password
    )

    $sql = "ALTER USER :""db_user"" WITH PASSWORD :'db_password';"
    Invoke-Docker -CommandArgs @(
        "exec", "-i", $Container,
        "psql",
        "-h", "127.0.0.1",
        "-U", $UserName,
        "-d", "postgres",
        "-v", "db_user=$UserName",
        "-v", "db_password=$Password",
        "-c", $sql
    )
    Write-Host ">>> [$Container] normalized postgres password for $UserName"

    $containerIp = (& docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" $Container).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($containerIp)) {
        throw "Failed to resolve container IP for $Container."
    }

    Invoke-Docker -CommandArgs @(
        "exec",
        "-e", "PGPASSWORD=$Password",
        $Container,
        "sh", "-lc",
        "psql -h ""$containerIp"" -U ""$UserName"" -d postgres -Atqc 'select 1'"
    )
    Write-Host ">>> [$Container] verified postgres password over bridge network for $UserName"
}

Import-EnvFile -Path $rootEnvFile

Sync-PostgresPassword `
    -Container "identity-postgres" `
    -UserName (Get-EnvValue -Name "IDENTITY_POSTGRES_USER" -Default "postgres") `
    -Password (Get-EnvValue -Name "IDENTITY_POSTGRES_PASSWORD" -Default "postgres")

Sync-PostgresPassword `
    -Container "job-postgres" `
    -UserName (Get-EnvValue -Name "JOB_POSTGRES_USER" -Default "postgres") `
    -Password (Get-EnvValue -Name "JOB_POSTGRES_PASSWORD" -Default "postgres")

Sync-PostgresPassword `
    -Container "notification-postgres" `
    -UserName (Get-EnvValue -Name "NOTIFICATION_POSTGRES_USER" -Default "postgres") `
    -Password (Get-EnvValue -Name "NOTIFICATION_POSTGRES_PASSWORD" -Default "postgres")
