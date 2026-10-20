#!/usr/bin/env bash
# PreToolUse (Bash): block force pushes to main and rm -rf on broad targets.
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
  local force=false seen_push=false word dest
  local positionals=()
  for word in "$@"; do
    if ! $seen_push; then
      [ "$word" = "push" ] && seen_push=true
      continue
    fi
    case "$word" in
      --force | --force-with-lease* | --force-if-includes | --mirror) force=true ;;
      --*) ;;
      -*f*) force=true ;;
      -*) ;;
      *) positionals+=("$word") ;;
    esac
  done
  $seen_push || return 0

  # The first positional is the remote, the rest are refspecs
  local refspecs=("${positionals[@]:1}")
  if [ "${#refspecs[@]}" -eq 0 ]; then
    $force && [ "$current_branch" = "main" ] && block "force push to main is not allowed. Push to a feature branch and open a PR."
    return 0
  fi
  for word in "${refspecs[@]}"; do
    [[ "$word" == +* ]] && force=true
  done
  $force || return 0
  for word in "${refspecs[@]}"; do
    word=${word#+}
    dest=${word##*:}
    dest=${dest#refs/heads/}
    if [ "$dest" = "main" ] || { [ "$dest" = "HEAD" ] && [ "$current_branch" = "main" ]; }; then
      block "force push to main is not allowed. Push to a feature branch and open a PR."
    fi
  done
}

check_rm() {
  local recursive=false forced=false word target
  local targets=()
  for word in "$@"; do
    case "$word" in
      --recursive) recursive=true ;;
      --force) forced=true ;;
      --*) ;;
      -*)
        [[ "$word" == *[rR]* ]] && recursive=true
        [[ "$word" == *f* ]] && forced=true
        ;;
      *) targets+=("$word") ;;
    esac
  done
  $recursive && $forced || return 0

  for word in "${targets[@]+"${targets[@]}"}"; do
    target=${word//\"/}
    target=${target//\'/}
    target=${target%/}
    case "$target" in
      "" | / | /\* | \~ | \~/\* | \$HOME | \$HOME/\* | \$\{HOME\} | \$\{HOME\}/\* | . | ./\* | .. | ../\* | \* | .\* | "$HOME" | "$HOME"/\*)
        block "rm -rf on '$word' is too broad. Remove specific paths instead."
        ;;
    esac
    # Top-level folders like /usr or /Users
    if [[ "$target" =~ ^/[^/]+$ ]]; then
      block "rm -rf on '$word' is too broad. Remove specific paths instead."
    fi
  done
}

# Check each simple command on its own, so `cd x && git push -f` is still caught
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
  args=("${words[@]:$i}")

  case "${args[0]}" in
    git) check_git_push "${args[@]:1}" ;;
    rm) check_rm "${args[@]:1}" ;;
  esac
done <<<"$segments"

exit 0
