#!/usr/bin/env bash
# PreToolUse (Bash): block any git push to main. Changes reach main through a PR.
# Exit 2 blocks the command and shows stderr to Claude.
set -u
set -f

cmd=$(jq -r '.tool_input.command // empty')
[ -n "$cmd" ] || exit 0

block() {
  echo "Blocked by .claude/hooks/block-forbidden-command.sh: $1" >&2
  exit 2
}

current_branch=$(git -C "${CLAUDE_PROJECT_DIR:-.}" branch --show-current 2>/dev/null)

check_git_push() {
  local seen_push=false word dest
  local positionals=()
  for word in "$@"; do
    if ! $seen_push; then
      [ "$word" = "push" ] && seen_push=true
      continue
    fi
    case "$word" in
      --all | --branches | --mirror) block "pushing all branches includes main. Push a feature branch and open a PR." ;;
      -*) ;;
      *) positionals+=("$word") ;;
    esac
  done
  $seen_push || return 0

  # The first positional is the remote, the rest are refspecs
  local refspecs=("${positionals[@]:1}")
  if [ "${#refspecs[@]}" -eq 0 ]; then
    [ "$current_branch" = "main" ] && block "pushing to main is not allowed. Push a feature branch and open a PR."
    return 0
  fi
  for word in "${refspecs[@]}"; do
    word=${word#+}
    dest=${word##*:}
    dest=${dest#refs/heads/}
    if [ "$dest" = "main" ] || { [ "$dest" = "HEAD" ] && [ "$current_branch" = "main" ]; }; then
      block "pushing to main is not allowed. Push a feature branch and open a PR."
    fi
  done
}

# Check each simple command on its own, so `cd x && git push origin main` is still caught
segments=$(printf '%s\n' "$cmd" | sed -E 's/(&&|\|\||;|\|)/\n/g')

while IFS= read -r segment; do
  read -ra words <<<"$segment"
  # Skip leading `sudo`, `env` and VAR=value
  i=0
  while [ "$i" -lt "${#words[@]}" ]; do
    case "${words[$i]}" in
      sudo | env | *=*) i=$((i + 1)) ;;
      *) break ;;
    esac
  done
  [ "$i" -lt "${#words[@]}" ] || continue

  [ "${words[$i]}" = "git" ] && check_git_push "${words[@]:$((i + 1))}"
done <<<"$segments"

exit 0
