#!/usr/bin/env bash
# Stop: type-check the project when .ts or .tsx files have changed, once per turn.
# Exit 2 keeps Claude working and sends the errors back so it fixes them.
set -u

input=$(cat)
# A second failure in the same turn is left to the user instead of looping
[ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -n "$(git status --porcelain -- '*.ts' '*.tsx' 2>/dev/null)" ] || exit 0

tsc="node_modules/.bin/tsc"
[ -x "$tsc" ] || exit 0

if ! out=$("$tsc" --noEmit 2>&1); then
  echo "Type check failed (pnpm exec tsc --noEmit):" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
