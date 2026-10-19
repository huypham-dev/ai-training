---
description: Write my daily standup from my own commits and PRs in this repo
argument-hint: "[since, default yesterday]"
allowed-tools: Bash(git log:*), Bash(git branch:*), Bash(git status:*), Bash(gh pr list:*)
---

# Standup

Write a short standup for me from what I did in this repo.

Period: since `$ARGUMENTS`, or since `yesterday` if empty. On a Monday with no argument, use `last friday`.

## Gather

- My commits on all branches: `git log --all --no-merges --author="$(git config user.name)" --since="<period>" --format="%h %ad %s" --date=short`
- My open PRs: `gh pr list --repo huypham-dev/ai-training --author @me --state open`
- Uncommitted work: `git status --short` and the current branch.

If `gh` fails, skip the PR part and say so in one line.

## Write

Three headings, at most four bullets each:

- **Done**: grouped by feature, not one bullet per commit. Use the plain idea, not the commit subject.
- **In progress**: open PRs and uncommitted work on the current branch.
- **Blockers**: only what is in the data (a failing build mentioned in commits, a PR waiting on review). If nothing, write `None`.

Write in English. Keep branch names, PR numbers and file names as they are. Do not invent work that is not in the data.
