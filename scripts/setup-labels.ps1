[CmdletBinding()]
param(
    [switch]$DryRun,
    [string]$Repo
)

$ErrorActionPreference = 'Stop'
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI (gh) is required.'
}
& gh auth status 2>$null
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI is not authenticated. Run gh auth login.' }

$repoArgs = @()
if ($Repo) { $repoArgs = @('--repo', $Repo) }
$existingJson = & gh label list @repoArgs --limit 1000 --json name,color,description
if ($LASTEXITCODE -ne 0) { throw 'Could not list repository labels.' }
$existing = @($existingJson | ConvertFrom-Json)
$names = @{}
foreach ($label in $existing) { $names[$label.name] = $true }

$definitions = @'
type: bug|d73a4a|Bug or regression
type: feature|1f883d|New functionality
type: security|b60205|Security-related work
type: support|0e8a16|Support request
type: documentation|0075ca|Documentation work
type: architecture|5319e7|Architecture decisions
type: product|a2eeef|Product planning and discovery
area: backend|c5def5|Backend
area: frontend|c5def5|Frontend
area: documentation|c5def5|Documentation
area: domain|c5def5|Domain modelling
area: architecture|c5def5|Architecture
area: product|c5def5|Product
area: infrastructure|c5def5|Infrastructure
priority: critical|b60205|Critical priority
priority: high|d93f0b|High priority
priority: medium|fbca04|Medium priority
priority: low|c2e0c6|Low priority
status: triage|ededed|Needs assessment
status: blocked|e99695|Blocked
dependencies|0366d6|Dependency updates
github-actions|bfdadc|GitHub Actions
gradle|bfdadc|Gradle dependencies
npm|bfdadc|npm dependencies
frontend|bfdadc|Frontend dependencies
documentation|bfdadc|Documentation dependencies
'@
foreach ($line in ($definitions -split "`r?`n")) {
    if (-not $line.Trim()) { continue }
    $parts = $line.Split('|', 3)
    $name, $color, $description = $parts
    $operation = if ($names.ContainsKey($name)) { 'edit' } else { 'create' }
    if ($DryRun) {
        Write-Host "[DRY RUN] $operation $name"
        continue
    }
    & gh label $operation $name @repoArgs --color $color --description $description
    if ($LASTEXITCODE -ne 0) { throw "Failed to $operation label: $name" }
}
