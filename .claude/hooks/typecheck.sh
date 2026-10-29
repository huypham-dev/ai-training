#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit): type-check the project after Claude edits a .ts or .tsx file.
# Exit 2 sends the errors back to Claude so it fixes them.
set -u

file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  *.ts | *.tsx) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
if ! out=$(pnpm exec tsc --noEmit 2>&1); then
  echo "Type check failed after editing $file:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
