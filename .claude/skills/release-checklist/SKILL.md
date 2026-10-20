---
name: release-checklist
description: Check that feat/todo-app is ready to release to main and report a pass/fail checklist. Use when the user runs /release-checklist or asks whether the app is ready to release, ship or merge to main.
argument-hint: "[base branch, default feat/todo-app]"
disable-model-invocation: true
---

# Release checklist

A release merges the integration branch into `main` on GitHub (`huypham-dev/ai-training`). This skill only checks and reports. It does not merge, push, tag or change Vercel settings; the person running it decides.

Input: `$ARGUMENTS`. If empty, the release branch is `feat/todo-app`.

## Fixed settings

- Remote: `github`. Never read from or push to `origin` for this flow.
- Release target: `main`.
- All rules in `CLAUDE.md` apply. Where `CLAUDE.md` says the remote is GitLab, this skill overrides it: releases go through GitHub.
- GitHub is read through the GitHub MCP server `github` (tools `mcp__github__*`). Call `mcp__github__get_me` first. If the tools are missing or a call fails, mark the GitHub checks as **not checked** and keep going with the local ones.

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

Call `mcp__github__list_pull_requests` with `owner: huypham-dev`, `repo: ai-training`, `base: <release branch>`, `state: open`.

List open PRs into the release branch. They are not a failure on their own, but the person releasing should know what is left out.

### 3. Build

```bash
pnpm install --frozen-lockfile
pnpm build
```

The build is also the type check. Read the real output; a failing build is a **fail**. Copy the first error into the report.

### 4. Deploy preview

The MCP server has no tool for the status of a bare commit SHA, so read it through the release PR:

1. Find the open PR from the release branch into `main` with `mcp__github__list_pull_requests` (`owner: huypham-dev`, `repo: ai-training`, `head: huypham-dev:<release branch>`, `base: main`, `state: open`). Its `head.sha` must equal `github/<release branch>`.
2. Read the status with `mcp__github__pull_request_read` (`method: get_status`, `pullNumber: <number>`).

- The `Vercel` status (its `target_url` points to the `huypham-dev-ai-training` project) must be `success`.
- No open release PR yet, or its `head.sha` differs: **not checked**, with that reason.

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
4. If ready and no release PR is open, the PR the person can open with `mcp__github__create_pull_request`: `owner: huypham-dev`, `repo: ai-training`, `base: main`, `head: <release branch>`, `title: "release: <summary>"`, `body: <summary of the release>`. Suggest it only; do not call it.
