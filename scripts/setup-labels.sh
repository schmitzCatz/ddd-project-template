#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=false
REPO=""
while (($#)); do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --repo) [[ $# -ge 2 && -n "$2" ]] || { echo 'Missing value for --repo' >&2; exit 2; }; REPO="$2"; shift 2 ;;
    -h|--help) echo 'Usage: setup-labels.sh [--dry-run] [--repo OWNER/REPO]'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done
command -v gh >/dev/null || { echo 'GitHub CLI (gh) is required.' >&2; exit 1; }
GH_ARGS=()
[[ -z "$REPO" ]] || GH_ARGS=(--repo "$REPO")
# Validate authentication and repository access before changing anything.
gh auth status >/dev/null
existing=$(gh label list "${GH_ARGS[@]}" --limit 1000 --json name,color,description --jq '.[].name')

while IFS='|' read -r name color description; do
  [[ -n "$name" ]] || continue
  if grep -Fxq -- "$name" <<< "$existing"; then
    operation=edit
  else
    operation=create
  fi
  if [[ "$DRY_RUN" == true ]]; then
    printf '[DRY RUN] %s %s\n' "$operation" "$name"
  else
    gh label "$operation" "$name" "${GH_ARGS[@]}" --color "$color" --description "$description" >/dev/null
    printf '%s %s\n' "$operation" "$name"
  fi
done <<'LABELS'
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
LABELS
