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

    $sql = @"
SELECT format('ALTER USER %I WITH PASSWORD %L', :'db_user', :'db_password') \gexec
"@

    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "docker"
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardInput = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true

    foreach ($argument in @(
        "exec", "-i", $Container,
        "psql",
        "-v", "ON_ERROR_STOP=1",
        "-h", "127.0.0.1",
        "-U", $UserName,
        "-d", "postgres",
        "-v", "db_user=$UserName",
        "-v", "db_password=$Password",
        "-f", "-"
    )) {
        [void]$startInfo.ArgumentList.Add($argument)
    }

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    [void]$process.Start()

    $process.StandardInput.WriteLine($sql)
    $process.StandardInput.Close()
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    if ($process.ExitCode -ne 0) {
        if (-not [string]::IsNullOrWhiteSpace($stdout)) {
            Write-Host $stdout
        }
        if (-not [string]::IsNullOrWhiteSpace($stderr)) {
            Write-Host $stderr
        }
        throw "Docker command failed with exit code $($process.ExitCode): docker exec -i $Container psql ..."
    }

    Write-Host ">>> [$Container] normalized postgres password for $UserName"

    $networkName = (& docker inspect -f "{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}" $Container | Select-Object -First 1).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($networkName)) {
        throw "Failed to resolve docker network for $Container."
    }

    $clientImage = (& docker inspect -f "{{.Config.Image}}" $Container).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($clientImage)) {
        throw "Failed to resolve client image for $Container."
    }

    Invoke-Docker -CommandArgs @(
        "run",
        "--rm",
        "--network", $networkName,
        "-e", "PGPASSWORD=$Password",
        $clientImage,
        "psql",
        "-h", $Container,
        "-U", $UserName,
        "-d", "postgres",
        "-Atqc", "select 1"
    )
    Write-Host ">>> [$Container] verified postgres password from peer container for $UserName"
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
