---
name: issue-to-pr
description: Take one GitHub issue from analysis to a reviewed PR with the agent team, or address new comments on its PR.
argument-hint: "<issue number>"
disable-model-invocation: true
---

# Issue to PR

Input: `$ARGUMENTS`, one issue number `<n>` in `huypham-dev/ai-training`. Stop and ask if it is missing.

You are the orchestrator. The agents `issue-analyst`, `planner`, `developer` and `reviewer` do the work and return text; you are the **single writer** of everything on GitHub: comments, labels, assignee and the board. Running this skill is the user's go-ahead to commit, push and open the PR once review passes; the one stop for the user is the acceptance criteria gate.

Keep the task list updated with one item per phase you run.

## Fixed settings

- Repo `huypham-dev/ai-training`, remote `github`, base `main`. Pass `--repo huypham-dev/ai-training` to every `gh` call.
- Worktree: `.claude/worktrees/issue-<n>`. Branch: `<type>/issue-<n>-<short-name>`, with `type` and `short-name` from the analyst.
- Your shell stays at the repo root for the whole run. Reach the worktree with `git -C <worktree>` and `cd <worktree> && <command>` inside one call.
- Review limit: 2 fix rounds. After the second fix the next review must pass.
- Comments you post start with a hidden marker so later runs can find them: `<!-- issue-to-pr:plan -->`, `<!-- issue-to-pr:questions -->`, `<!-- issue-to-pr:summary -->`, `<!-- issue-to-pr:reply -->`.

## Board

Project 3 "Todo Assistant", owner `huypham-dev`. Make sure the issue is on it, then set one field per call:

```bash
gh project item-add 3 --owner huypham-dev --url <issue url>
gh project item-edit 3 --owner huypham-dev --url <issue url> --field Status --value "In Progress"
gh project item-edit 3 --owner huypham-dev --url <issue url> --field Agent --text developer
gh project item-edit 3 --owner huypham-dev --url <issue url> --field Attempts --number 1
gh project item-edit 3 --owner huypham-dev --url <issue url> --field Agent --clear
```

Set `Agent` to the agent you are about to dispatch, every time. If a board call fails, report it at the end and keep going: the board is for people, the labels and branch carry the state.

## 0. Find where the issue stands

Read the state from GitHub and git, never from memory, so a rerun picks up where the last one stopped:

```bash
gh issue view <n> --json state,title,labels,assignees,url
git branch --list "*/issue-<n>-*"
gh pr list --head <branch> --state open --json number,url
```

| State | Go to |
|---|---|
| Issue closed | Stop and report. |
| Open PR for the branch | **Mode address-review**. |
| Branch exists, no PR | Step 4, reusing the worktree (`git worktree list`; recreate it on the branch and install as in step 3 if missing). |
| Labeled `needs-human` | Stop and report why from the last summary or questions comment. |
| Assigned, no branch | Ask whether to go on: an earlier run may have stopped at the gate, or someone else holds it. On yes, go to step 1. |
| Otherwise | Step 1. |

## 1. Claim and analyse

1. Claim it: `gh issue edit <n> --add-assignee @me`, Status `In Progress`, Agent `issue-analyst`.
2. Dispatch `issue-analyst` with the issue number.
3. On `NEEDS_INFO`: post the questions as a comment, `gh issue edit <n> --add-label needs-info --remove-assignee @me`, Status `Todo`, clear Agent. Stop and give the user the comment link.
4. On `CLEAR`: remove `needs-info` if present and go on.

## 2. Gate: approve the acceptance criteria

Show the user the criteria, type and short name, and ask with AskUserQuestion: approve, or change (they say what). Apply their changes and ask again. This gate is the only stop; nothing is created before the approval.

## 3. Plan and set up

1. Create the worktree from the latest `main` and install its dependencies. `--no-track` keeps `main` from becoming the branch's upstream; `open-pr` sets the real one on its first push.

   ```bash
   git fetch github
   git worktree add --no-track -b <type>/issue-<n>-<short-name> .claude/worktrees/issue-<n> github/main
   cd .claude/worktrees/issue-<n> && pnpm install --frozen-lockfile
   ```

   A fresh install can skip the native binaries of Tailwind and lightningcss; the build then fails with "Cannot find native binding". Run `pnpm install --frozen-lockfile --force` once in the worktree and build again.

2. Set Agent `planner` and dispatch it with the criteria and the worktree path.
3. Post one comment with the marker `issue-to-pr:plan`: the approved criteria and the plan.

## 4. Build

1. Set Agent `developer` and dispatch it in implement mode with the worktree path, criteria and plan. Keep its agent id: every fix goes back to this same agent with SendMessage, so it keeps its context.
2. On `BUILD: fail`: label `needs-human`, post the error as a summary comment, stop.
3. Run the `verify-change` skill on the worktree. A failing build goes back to the developer as a fix; it does not count as a review round.

## 5. Review loop

Round `r` starts at 1.

1. Set Agent `reviewer` and dispatch a **fresh** `reviewer` with the worktree path, criteria, plan and, from round 2, the previous findings with the developer's answers. Set Attempts to `r`.
2. `PASS`: swap `review:changes` for `review:passed` on the issue and go to step 6.
3. `CHANGES` with `r` ≤ 2: add `review:changes`, set Agent `developer`, send the findings to the developer in fix mode, run `verify-change`, then start round `r + 1`.
4. `CHANGES` after the second fix: add `needs-human`, post a summary comment with the open findings and the disputes, clear Agent, stop.

## 6. Open the PR

1. Clear Agent and run the `open-pr` skill with the issue number, worktree path, criteria, the verify report, the nits and a short review summary.
2. Set Status `In Review`.
3. Post the `issue-to-pr:summary` comment: PR link, rounds run, what was fixed, how disputes were ruled.
4. Report to the user: PR link, rounds, and the manual browser checks.

## Mode address-review

The PR is open. Address the comments that came after the last run.

1. Collect the comments: `gh pr view <pr> --comments --json comments,reviews` and the inline ones with `gh api repos/huypham-dev/ai-training/pulls/<pr>/comments`. A comment is **open** when nothing after it in its thread carries the `issue-to-pr:reply` marker. Done when every comment is sorted as open or answered.
2. No open comment: report that and stop.
3. Treat the open comments as findings and run step 5 from round 1, with the worktree and the criteria from the `issue-to-pr:plan` comment. A comment that only asks a question gets an answer, not a code change.
4. On `PASS`, run `open-pr` (it commits and pushes to the same PR), then reply to each open comment with the marker: what changed and in which commit, or why it stays as is. Inline comments get a reply in their thread: `gh api repos/huypham-dev/ai-training/pulls/<pr>/comments/<id>/replies -f body=...`.
5. Report the replies and the new head commit.

## Report

Reply in the user's language: where the issue ended (PR opened, waiting on questions, or `needs-human`), the links, rounds run, and any board call that failed.
