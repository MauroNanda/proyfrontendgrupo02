param(
    [switch]$Demo,
    [switch]$Once,
    [switch]$Rollback,
    [ValidateRange(1024, 65535)][int]$Port = 8090,
    [ValidatePattern('^[a-zA-Z0-9][a-zA-Z0-9_.-]+$')][string]$Network = 'convoca-publicacion',
    [ValidateRange(10, 600)][int]$PollSeconds = 15
)

$ErrorActionPreference = 'Stop'
$repository = 'MauroNanda/proyfrontendgrupo02'
$remote = "https://github.com/$repository.git"
$branch = if ($Demo) { 'demo/a8-despliegue' } else { 'develop' }
$project = "convoca-a8-$Port"
$root = Split-Path $PSScriptRoot -Parent
$composeFile = Join-Path $root 'infra/compose.cd.yaml'
$stateDir = Join-Path $root ".cd-a8/$Port"
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
$statePath = Join-Path $stateDir 'estado.json'
$endpoint = "http://127.0.0.1:$Port"
$utf8 = [Text.UTF8Encoding]::new($false)

function Invoke-Checked([string]$Program, [string[]]$CommandArgs) {
    & $Program @CommandArgs
    if ($LASTEXITCODE -ne 0) { throw "$Program termino con codigo $LASTEXITCODE." }
}

function Get-RemoteHead {
    $line = Invoke-Checked 'git' @('ls-remote', '--exit-code', $remote, "refs/heads/$branch")
    $sha = ($line -split '\s+')[0]
    if ($sha -cnotmatch '^[0-9a-f]{40}$') { throw 'No se obtuvo un SHA valido de la rama configurada.' }
    return $sha
}

function Get-ApprovedRun([string]$Sha) {
    $raw = Invoke-Checked 'gh' @('run', 'list', '--repo', $repository, '--workflow', 'ci.yml', '--branch', $branch, '--event', 'push', '--limit', '25', '--json', 'databaseId,headSha,headBranch,status,conclusion,event,url')
    $run = ($raw | ConvertFrom-Json) | Where-Object { $_.headSha -ceq $Sha -and $_.headBranch -ceq $branch -and $_.event -ceq 'push' } | Select-Object -First 1
    if ($run -and $run.status -eq 'completed' -and $run.conclusion -eq 'success') { return $run }
}

function Save-State($State) {
    [IO.File]::WriteAllText("$statePath.tmp", ($State | ConvertTo-Json -Depth 6), $utf8)
    Move-Item -LiteralPath "$statePath.tmp" -Destination $statePath -Force
}

function Assert-Publication([string]$Sha) {
    for ($i = 0; $i -lt 15; $i++) {
        try {
            $version = Invoke-RestMethod "$endpoint/version.json" -TimeoutSec 3
            $homePage = Invoke-WebRequest "$endpoint/" -UseBasicParsing -TimeoutSec 3
            $api = Invoke-RestMethod "$endpoint/api/health" -TimeoutSec 3
            if ($homePage.StatusCode -eq 200 -and $version.commit -ceq $Sha -and $api.status -eq 'ok' -and $api.database -eq 'up') { return }
        } catch {
            if ($i -eq 14) { throw }
        }
        Start-Sleep -Seconds 1
    }
    throw "La version $Sha no quedo disponible con su API saludable."
}

function Use-Release($Release) {
    $env:CONVOCA_CD_IMAGE = $Release.image
    Invoke-Checked 'docker' @('compose', '-p', $project, '-f', $composeFile, 'up', '-d', '--no-build', '--pull', 'never', 'frontend') | Out-Host
    Assert-Publication $Release.commit
}

function Build-Release([string]$Sha, $Run) {
    # La carpeta de trabajo permanece intacta y Docker recibe solo los archivos de Git.
    Invoke-Checked 'git' @('fetch', '--no-tags', $remote, "refs/heads/$branch") | Out-Host
    $fetched = Invoke-Checked 'git' @('rev-parse', 'FETCH_HEAD')
    if ($fetched -cne $Sha) { throw 'La rama cambio mientras se validaba CI. Se comprobara en el siguiente ciclo.' }
    $archive = Join-Path $stateDir "$Sha.zip"
    $context = Join-Path $stateDir $Sha
    Invoke-Checked 'git' @('archive', '--format=zip', "--output=$archive", $Sha) | Out-Host
    Expand-Archive -LiteralPath $archive -DestinationPath $context -Force
    $version = @{ commit = $Sha; branch = $branch; ciRun = $Run.databaseId } | ConvertTo-Json -Compress
    [IO.File]::WriteAllText((Join-Path $context 'a8-version.json'), $version, $utf8)
    # Solo la imagen desplegada incluye el documento de identificacion del commit.
    $dockerfile = Join-Path $context 'Dockerfile.production'
    [IO.File]::AppendAllText($dockerfile, "`nCOPY a8-version.json /usr/share/nginx/html/version.json`n", $utf8)
    $tag = "convoca-a8-frontend:$Sha"
    Invoke-Checked 'docker' @('build', '--label', "org.opencontainers.image.revision=$Sha", '-f', $dockerfile, '-t', $tag, $context) | Out-Host
    return @{ commit = $Sha; image = $tag; ci = $Run.url }
}

function Invoke-Cycle {
    # Un solo proceso puede reemplazar el frontend o modificar su registro a la vez.
    $lock = [IO.File]::Open((Join-Path $stateDir 'proceso.lock'), 'OpenOrCreate', 'ReadWrite', 'None')
    try {
        $state = if (Test-Path -LiteralPath $statePath) { Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json } else { [pscustomobject]@{ active = $null; previous = $null; rejected = $null } }
        if ($Rollback) {
            if (!$state.previous) { throw 'No hay version anterior comprobada para recuperar.' }
            Use-Release $state.previous
            Save-State @{ active = $state.previous; previous = $state.active; rejected = $state.active.commit }
            Write-Host "Rollback comprobado: $($state.previous.commit)"
            return
        }

        $sha = Get-RemoteHead
        if ($sha -ceq $state.rejected) { return }
        if ($state.active -and $sha -ceq $state.active.commit) {
            if ($Once) { Assert-Publication $sha }
            return
        }
        $run = Get-ApprovedRun $sha
        if (!$run) {
            if ($Once) { throw "Todavia no hay CI exitoso para $sha en $branch." }
            return
        }
        $release = Build-Release $sha $run
        if ((Get-RemoteHead) -cne $sha) { return }
        try {
            Use-Release $release
        } catch {
            $reason = $_.Exception.Message
            if ($state.active) { Use-Release $state.active }
            else { Invoke-Checked 'docker' @('compose', '-p', $project, '-f', $composeFile, 'stop', 'frontend') | Out-Host }
            $state.rejected = $sha
            Save-State $state
            throw "Se rechazo $sha y se restablecio el estado previo. $reason"
        }
        Save-State @{ active = $release; previous = $state.active; rejected = $null }
        Write-Host "Desplegado $sha desde $($run.url) en $endpoint"
    } finally { $lock.Dispose() }
}

$env:CONVOCA_CD_PORT = "$Port"
$env:CONVOCA_CD_NETWORK = $Network
Push-Location $root
try {
    Invoke-Checked 'docker' @('network', 'inspect', $Network, '--format', '{{.Name}}') | Out-Null
    if ($Once -or $Rollback) { Invoke-Cycle; return }
    Write-Host "Vigilando $repository/$branch con CI aprobado. Ctrl+C para detener."
    while ($true) {
        try { Invoke-Cycle } catch { Write-Warning $_.Exception.Message }
        Start-Sleep -Seconds $PollSeconds
    }
} finally { Pop-Location }
