#!/usr/bin/env bash
set -euo pipefail

# Pushes the current branch to a configured GitHub remote.
# Usage:
#   ./push-to-github.sh origin
#   ./push-to-github.sh origin work
# If the remote does not exist yet, set GITHUB_REMOTE_URL and the script will add it.

REMOTE_NAME="${1:-origin}"
BRANCH_NAME="${2:-$(git symbolic-ref --short HEAD)}"

if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "This script must be run inside a git repository." >&2
  exit 1
fi

if ! git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
  echo "Branch '${BRANCH_NAME}' does not exist locally. Aborting." >&2
  exit 1
fi

# Add remote if missing and URL is provided via env var.
if ! git remote get-url "${REMOTE_NAME}" > /dev/null 2>&1; then
  if [[ -z "${GITHUB_REMOTE_URL:-}" ]]; then
    echo "Remote '${REMOTE_NAME}' is not configured. Set GITHUB_REMOTE_URL to add it automatically." >&2
    exit 1
  fi
  echo "Adding remote '${REMOTE_NAME}' with URL: ${GITHUB_REMOTE_URL}" >&2
  git remote add "${REMOTE_NAME}" "${GITHUB_REMOTE_URL}"
fi

echo "Pushing branch '${BRANCH_NAME}' to '${REMOTE_NAME}'..." >&2
git push -u "${REMOTE_NAME}" "${BRANCH_NAME}"
