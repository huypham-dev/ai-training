#!/usr/bin/env bash
# PreToolUse (Edit|Write|MultiEdit): block edits to local env files and lock files.
# Exit 2 blocks the edit and shows stderr to Claude.
set -u

file=$(jq -r '.tool_input.file_path // empty')
[ -n "$file" ] || exit 0

case "$(basename "$file")" in
  .env*.local | pnpm-lock.yaml | package-lock.json)
    echo "Blocked by .claude/hooks/protect-files.sh: $file is protected. Env files hold secrets, and lock files change only through pnpm." >&2
    exit 2
    ;;
esac
exit 0
