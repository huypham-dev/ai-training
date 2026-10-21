# Loops

Recurring checks that Claude Code runs with `/loop` while a pull request is open. Each loop is a cron job inside one Claude session: it fires only while that session is open and idle, and it expires after 7 days. Start one with `/loop <interval> <prompt>` and cancel it with `CronDelete <job id>`.

Every run reads this file and follows the section for its loop.

## Deploy check

Started with `/loop 5m check the deploy, following loop.md`. Watches the Vercel preview deployments of the open pull request on GitHub (`huypham-dev/ai-training`).

### Each run

1. Find the open PR for the current branch: `gh pr view --repo huypham-dev/ai-training --json number,state,headRefOid`.
2. Read the commit statuses of the PR head:
   `gh api repos/huypham-dev/ai-training/commits/<head sha>/status`
   The only Vercel project is `Vercel – huypham-dev-ai-training`, the deploy of this app. It must succeed.
3. Compare with the base branch head (`github/main`). A deploy that fails on the PR but succeeds on the base is a failure caused by the PR.
4. When a deploy caused by the PR fails, run `pnpm build` on the branch. If the build fails locally, report the error. The deploy logs need a logged-in Vercel CLI (`npx vercel inspect <deployment id> --logs`), so ask the user for them instead of running it.

The loop only reads. It does not commit, push, redeploy or change Vercel settings.

### When to stop

Delete the cron job (`CronDelete`) and say why when any of these hold:

- The PR is merged or closed.
- `huypham-dev-ai-training` succeeds on the PR head and nothing new has been pushed for 3 runs in a row.
- The same failure caused by the PR shows up 3 runs in a row with no new commit. Waiting longer will not change it, so it needs the user.

### How to report

- **Nothing changed since the last run**: one line, such as `Deploy unchanged on 8258f14: app ok.`
- **Something changed** (a new commit, a status that flipped, a new failure): a short table showing the deploy state on the PR head and on the base, followed by one line on what changed.
- **The loop stops**: one line with the reason and the last deploy state.

Replies to the user are in Vietnamese. Commands, statuses and file names stay as they are.

## Autonomous PR check

Started with `/loop 15m` and no prompt. It runs Claude Code's built-in autonomous check on the open PR:

- CI status, unresolved review threads, and whether the branch is behind `main`.
- It continues work the user already approved in the session. New work and pushes need the user's OK.
- When there is nothing to do it reports one line, and after 3 quiet runs only a short CI check.
