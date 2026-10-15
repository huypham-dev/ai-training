---
name: work-task
description: Implement one ticket end to end in this repo, from the pasted ticket or issue link to a draft GitHub pull request against feat/todo-app. Use when the user runs /work-task or asks to take a ticket all the way to a PR/MR.
argument-hint: "[--auto] <issue link or pasted ticket text>"
disable-model-invocation: true
---

# Work a ticket from paste to pull request

Input: `$ARGUMENTS`

The input is a GitHub issue link or the ticket text pasted as is. If it starts with `--auto`, skip the plan approval in step 3, except when that step says it must still stop.

## Fixed settings

- Base branch and PR target: `feat/todo-app`.
- Git remote for pushing: `github` (`huypham-dev/ai-training` on GitHub). Never push to `origin`.
- PRs are made with the `gh` CLI. If `gh` is missing or `gh auth status` fails, stop before step 1 and tell the user how to install or log in. Do not fall back to another tool.
- All rules in `CLAUDE.md` apply, and `DESIGN.md` applies to any UI change. Read them in step 2 instead of relying on memory. Where `CLAUDE.md` says the remote is GitLab and `gh` does not work, this skill overrides it: this flow targets GitHub.

Keep the task list updated with one item per step below.

## Steps

### 1. Read the ticket

- Link: read it with `gh issue view <link> --comments`.
- Text: use it as given.

Write a short summary: goal, acceptance criteria, what is out of scope. Keep the issue number if there is one.

### 2. Analyse

- Read `CLAUDE.md`, and `DESIGN.md` if the ticket touches the UI.
- Find and read the code the ticket affects. Check library APIs in `node_modules/` type definitions, as `CLAUDE.md` requires.
- Write a plan: files to change, the approach, risks, and open questions.

### 3. Plan approval (stop)

Show the summary and plan, then wait for the user's OK.

With `--auto`, continue without waiting, but still stop and ask when any of these hold:
- the ticket can be read in two ways that lead to different code,
- acceptance criteria are missing,
- the plan needs a new dependency, a new file type (tests, config, CI) or a refactor outside the ticket.

### 4. Create the branch

```bash
git fetch github feat/todo-app
git switch -c <type>/<short-name> github/feat/todo-app
```

`<type>` comes from the ticket (`feat`, `fix`, `chore`, `docs`, `refactor`). If the working tree is not clean, stop and ask before switching.

### 5. Implement

Follow the plan and the conventions in `CLAUDE.md`. If the change adds a visual rule or component, update `DESIGN.md` in the same change. Stay inside the ticket's scope. Note anything else worth doing as a follow-up for the PR description.

### 6. Review

Run the `/code-review` skill on the current diff. Fix the findings that are real bugs or break `CLAUDE.md` rules. Note the ones you chose not to fix and why.

### 7. Test

- Run `pnpm build` and read the real result.
- If the ticket changes the UI or the chat behaviour, run the app (`pnpm dev`) and check the change in the browser. Note exactly what you checked.
- If a check could not be run (for example the chat needs `OPENAI_API_KEY`), write that down. Do not claim it passed.

### 8. Fix loop

If step 6 or 7 fails, go back to step 5. After 3 rounds that still fail, stop, show what fails and ask the user. Do not open a PR with a failing build.

### 9. Approval before the PR (stop)

Always stop here, even with `--auto`. Show:
- the diff (open the diff pane),
- the build and test results,
- the commit message and the PR title and body you plan to use.

Wait for the user's OK.

### 10. Commit, push, open a draft PR

```bash
git add <changed files>
git commit    # subject `<type>: <summary>`, plus the attribution lines from the session
git push -u github <branch>
gh pr create --draft --repo huypham-dev/ai-training --base feat/todo-app --head <branch> --title "<type>: <summary>" --body-file <file>
```

The PR body has these sections:
- **Ticket**: the link, or `Closes #<n>` for a GitHub issue.
- **Changes**: what changed and why.
- **Testing**: what was run and checked, with results.
- **Not tested**: what was not checked.
- **Follow-up**: out-of-scope work noticed along the way, if any.

Leave the PR as a draft; the user marks it ready for review. Finish with the PR link.
