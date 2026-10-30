---
name: verify-change
description: Verify a change in this repo before review or a PR: install if needed, run the build, and list what still needs a browser check. Use when issue-to-pr reaches verification, or when the user asks whether a branch or worktree builds.
argument-hint: "[worktree path, default the repo root]"
---

# Verify change

Input: `$ARGUMENTS`, a worktree path. Empty means the repo root. Every command below runs with `cd <path> &&`.

## Steps

1. If `node_modules` is missing, run `pnpm install --frozen-lockfile`.
2. Run `pnpm build`. It is also the type check. Read the real output; done when you have the result and, on failure, the first error. "Cannot find native binding" means the install skipped a native binary: run `pnpm install --frozen-lockfile --force` once and build again.
3. List the changed files: `git diff --name-only github/main...HEAD` plus `git status --porcelain`.
4. Decide the browser check. Changes under `src/components/`, `src/app/` or `globals.css` change what the user sees, and changes in `src/hooks/useTodoCopilot.tsx` change what the chat can do. For each, write one line saying what to try in the app.

## Report

```
BUILD: pass | fail (<first error>)
BROWSER: not needed | not run — <lines to try, one per changed behaviour>
```

The browser check is reported as not run, with its lines, so the PR body can carry them as manual checks. This skill reports and changes nothing.
