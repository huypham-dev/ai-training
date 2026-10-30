---
name: open-pr
description: Commit an issue worktree, push its branch to the github remote and open or update its PR into main. Use when issue-to-pr reaches its PR step, or the user asks to open the PR for an issue branch.
argument-hint: "<issue number> <worktree path>"
---

# Open PR

Input: `$ARGUMENTS`, the issue number and the worktree path. Every git command runs with `git -C <worktree>`. The caller also hands over the PR body parts: acceptance criteria, verify report, nits and the review summary.

## Fixed settings

- Repo `huypham-dev/ai-training`, remote `github`, base `main`. `origin` is never used.
- The branch is the worktree's current branch, `<type>/issue-<n>-<short-name>`. Stop if it is `main`.
- Commit subject `<type>: <summary>`, in English, `<type>` from the branch name. End the message with:

  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

## Steps

1. `git status --porcelain`. Stage with `git add -A`; review the staged list and unstage anything outside the change (`.env*`, build output, editor files).
2. Commit when anything is staged. The first commit summarises the issue; a later commit summarises what it fixes, like `fix: address review on undo toast`.
3. `git push -u github <branch>`.
4. Look for an open PR: `gh pr list --repo huypham-dev/ai-training --head <branch> --state open --json number,url`.
5. With no PR, write the body to a file in the scratchpad and run `gh pr create --repo huypham-dev/ai-training --base main --head <branch> --title "<commit subject>" --body-file <file>`. With a PR, the push already updated it.
6. Return the PR number and URL. Done when `gh pr view <number>` shows the pushed head commit.

## PR body

```markdown
## Summary
<2–3 lines on what changed and why>

Closes #<n>

## Acceptance criteria
- [x] 1. <criterion>
- [x] 2. ...

## Verification
- `pnpm build`: pass
- Not run in the browser. Manual checks:
  - [ ] <line from verify-change>

## Review
<rounds run, findings fixed, disputes and how they were ruled>

<details><summary>Nits left open</summary>

- <nit>
</details>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Drop the nits block when there are none.
