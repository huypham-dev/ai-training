#!/usr/bin/env bash
# PreToolUse (Edit|Write|MultiEdit|Bash): block writes to local env files and lock files.
# Exit 2 blocks the tool call and shows stderr to Claude.
set -u

input=$(cat)
protected='(\.env[^[:space:]/]*\.local|pnpm-lock\.yaml|package-lock\.json)'

block() {
  echo "Blocked by .claude/hooks/protect-files.sh: $1 Env files hold secrets, and lock files change only through pnpm." >&2
  exit 2
}

if [ "$(jq -r '.tool_name // empty' <<<"$input")" = "Bash" ]; then
  cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
  # Reading these files stays allowed; only commands that write to them are blocked
  writes="(>[>|]?[[:space:]]*[^[:space:];&|]*$protected"
  writes+="|\b(sed|perl)[[:space:]][^;&|]*-i[^;&|]*$protected"
  writes+="|\b(tee|rm|mv|cp|truncate|dd)[[:space:]][^;&|]*$protected)"
  if grep -Eq "$writes" <<<"$cmd"; then
    block "this command writes to a protected file."
  fi
  exit 0
fi

file=$(jq -r '.tool_input.file_path // empty' <<<"$input")
[ -n "$file" ] || exit 0
if grep -Eq "^$protected\$" <<<"$(basename "$file")"; then
  block "$file is protected."
fi
exit 0
