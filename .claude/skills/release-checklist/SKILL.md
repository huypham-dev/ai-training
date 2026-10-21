---
name: release-checklist
description: Check that a branch is ready to merge into main and report a pass/fail checklist. Use when the user runs /release-checklist or asks whether the app is ready to release, ship or merge to main.
argument-hint: "[branch, default the current branch]"
disable-model-invocation: true
---

# Release checklist

A release merges a branch into `main` on GitHub (`huypham-dev/ai-training`). This skill only checks and reports. It does not merge, push, tag or change Vercel settings; the person running it decides.

Input: `$ARGUMENTS`. If empty, the release branch is the current branch (`git branch --show-current`).

## Fixed settings

- Remote: `github`. Never read from or push to `origin` for this flow.
- Release target: `main`.
- All rules in `CLAUDE.md` apply. Where `CLAUDE.md` says the remote is GitLab and `gh` does not work, this skill overrides it: releases go through GitHub.
- If `gh auth status` fails, mark the GitHub checks as **not checked** and keep going with the local ones.

Keep the task list updated with one item per section below.

## Checks

Run every check, even after one fails, so the report is complete. Each check ends as **pass**, **fail** or **not checked** (with the reason).

### 1. Branch state

```bash
git fetch github
git status --porcelain
git log --oneline github/main..github/<release branch>
git log --oneline github/<release branch>..github/main
```

- Working tree is clean.
- The release branch has commits that `main` does not. If not, stop: there is nothing to release.
- `main` has no commits missing from the release branch. If it has, the release branch needs `main` merged in first.

Check out the release branch at `github/<release branch>` in detached HEAD (`git switch --detach github/<release branch>`) so the build runs on exactly what will ship. Switch back to the starting branch at the end.

### 2. Open work

```bash
gh pr list --repo huypham-dev/ai-training --base <release branch> --state open
```

List open PRs into the release branch. They are not a failure on their own, but the person releasing should know what is left out.

### 3. Build

```bash
pnpm install --frozen-lockfile
pnpm build
```

The build is also the type check. Read the real output; a failing build is a **fail**. Copy the first error into the report.

### 4. Deploy preview

```bash
gh api repos/huypham-dev/ai-training/commits/<release branch head sha>/status
```

- `Vercel – huypham-dev-ai-training` must be `success`.

### 5. Docs match the code

Read the diff `github/main...github/<release branch>` and check:

- A new or renamed env variable in `src/` appears in `README.md` and `CLAUDE.md`.
- A new or renamed agent tool in `hooks/useTodoCopilot.tsx` is listed in `README.md` (How it works) and `CLAUDE.md` (Architecture).
- A UI change that adds a visual rule or component is described in `DESIGN.md`.
- New `pnpm` scripts appear under Commands in `CLAUDE.md`.

Name each mismatch with its file. Docs that still match are a **pass**.

### 6. Leftovers

Search the diff (added lines only) for:

- `console.log`, `debugger`
- `TODO`, `FIXME`
- Secrets: lines that look like API keys, and any `.env` file in the diff.

A secret is always a **fail**. Report the others with file and line, and let the person decide.

### 7. Manual checks (not automated)

List these for the person to tick off; never mark them as passed:

- The app loads on the Vercel preview and the list survives a reload.
- The chat answers and can add, change and delete a todo (needs `OPENAI_API_KEY` on Vercel).
- Saved threads show in the drawer (needs `CPK_INTELLIGENCE_API_KEY`).

## Report

Reply in the user's language. Commands, statuses and file names stay as they are.

1. One line verdict: **Ready**, **Ready with notes** or **Not ready**.
2. A table: check, result, details.
3. The open PRs from check 2 and the manual checks from check 7.
4. If ready, the command the person can run to open the release PR. Do not run it:

```bash
gh pr create --repo huypham-dev/ai-training --base main --head <release branch> --title "release: <summary>" --body-file <file>
```
