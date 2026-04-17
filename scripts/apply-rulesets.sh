#!/usr/bin/env bash
# Apply (create or update) GitHub Repository Rulesets from .github/rulesets/*.json
#
# Usage: ./scripts/apply-rulesets.sh
# Requires: gh CLI authenticated with repo admin scope.

set -euo pipefail

REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
RULESET_DIR=".github/rulesets"

if [[ ! -d "$RULESET_DIR" ]]; then
  echo "No $RULESET_DIR directory found"
  exit 1
fi

echo "Target repo: $REPO"

for file in "$RULESET_DIR"/*.json; do
  [[ -f "$file" ]] || continue
  name=$(jq -r '.name' "$file")
  echo ""
  echo "Applying ruleset '$name' from $file"

  # Look up existing ruleset by name
  existing_id=$(gh api "/repos/$REPO/rulesets" --jq ".[] | select(.name == \"$name\") | .id" || true)

  if [[ -n "$existing_id" ]]; then
    echo "  → updating existing ruleset id=$existing_id"
    gh api --method PUT "/repos/$REPO/rulesets/$existing_id" --input "$file" > /dev/null
  else
    echo "  → creating new ruleset"
    gh api --method POST "/repos/$REPO/rulesets" --input "$file" > /dev/null
  fi
  echo "  ✓ done"
done

echo ""
echo "All rulesets applied."
