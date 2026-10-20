#!/usr/bin/env bash
# Stop: show a macOS notification when Claude finishes a turn.
set -u

cat >/dev/null
command -v osascript >/dev/null || exit 0

project=$(basename "${CLAUDE_PROJECT_DIR:-$PWD}")
osascript -e "display notification \"Claude finished in $project\" with title \"Claude Code\" sound name \"Glass\"" >/dev/null 2>&1
exit 0
