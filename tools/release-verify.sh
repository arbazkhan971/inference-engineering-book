#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -n "$(git status --porcelain=v1)" ]]; then
  echo "error: release verification requires a clean committed worktree" >&2
  git status --short >&2
  exit 1
fi

tools/check-release-toolchain.sh
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
evidence_dir="${RELEASE_EVIDENCE_DIR:-build/release-evidence/$stamp}"
mkdir -p "$evidence_dir"

set +e
STRICT_EXTERNAL=1 RELEASE_EVIDENCE_DIR="$evidence_dir" \
  tools/verify.sh 2>&1 | tee "$evidence_dir/verify.log"
# Any command, including a scalar assignment, replaces Bash's PIPESTATUS.
# Snapshot the whole array before reading either pipeline member.
pipeline_status=("${PIPESTATUS[@]}")
verify_status=${pipeline_status[0]}
tee_status=${pipeline_status[1]}
set -e
if [[ "$verify_status" -ne 0 || "$tee_status" -ne 0 ]]; then
  echo "RELEASE VERIFICATION FAILED; evidence retained at $evidence_dir" >&2
  [[ "$verify_status" -ne 0 ]] && exit "$verify_status"
  exit "$tee_status"
fi

if [[ -n "$(git status --porcelain=v1)" ]]; then
  echo "error: release build changed the committed worktree" >&2
  git status --short >&2
  exit 1
fi

echo "RELEASE VERIFICATION PASSED; evidence retained at $evidence_dir"
