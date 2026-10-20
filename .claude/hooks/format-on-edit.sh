#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit): run prettier on the file Claude just changed.
set -u

file=$(jq -r '.tool_input.file_path // empty')
[ -n "$file" ] && [ -f "$file" ] || exit 0

case "$file" in
  "$CLAUDE_PROJECT_DIR"/*) ;;
  *) exit 0 ;;
esac

case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.css) ;;
  *) exit 0 ;;
esac

prettier="$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0

# A formatting failure should not block the edit, so only report it
if ! out=$("$prettier" --write --ignore-unknown --log-level warn "$file" 2>&1); then
  echo "prettier failed on $file: $out" >&2
fi
exit 0
