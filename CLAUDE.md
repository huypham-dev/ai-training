# CLAUDE.md

## Project

A training repo for building AI features. It is one app at the repo root: a Next.js todo list with an embedded CopilotKit chat that can read and change the list.

## Commands

Run from the repo root with pnpm.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # also the type check
```

- The chat needs `OPENAI_API_KEY` in `.env.local`.
- Saved conversations need `CPK_INTELLIGENCE_API_KEY` in `.env.local`. Without it the chat still works, but the threads drawer stays empty.
- There are no tests, and ESLint is not set up. Prettier is installed with its default config.

## Stack

Next.js 14 (App Router), React 18, TypeScript strict, Tailwind CSS 4 (tokens in `@theme` in `globals.css`, no `tailwind.config.js`), CopilotKit 1.77 (v2 entry points), zod 4.

## Architecture

All paths are under `src/`.

- Todos live in React state inside `hooks/useTodos.ts`, which also saves them to `localStorage` (key `todos`) and loads them back after mount.
- `components/TodoList.tsx` creates the store and passes it to `hooks/useTodoCopilot.tsx`, which shares the list with the agent (`useAgentContext`) and registers four frontend tools: `updateTodoList` (upsert many), `updateTodo` (change one), `deleteTodo` and `clearCompletedTodos` (remove all completed).
- The agent runs on the server in `app/api/copilotkit/[[...slug]]/route.ts`. The tools run in the browser and change the store.
- Chat threads are saved by CopilotKit Intelligence, which the runtime in that route uses when its key is set. `components/copilot/TodoThreadsDrawer.tsx` lists them, and the `CopilotChatConfigurationProvider` in `components/copilot/CopilotProvider.tsx` shares the active thread between the drawer and the chat. A reload starts a new thread; the earlier ones are opened from the drawer.
- `components/chat/` holds the custom chat slot components, and `components/copilot/` holds the CopilotKit provider, chat and threads drawer wrappers.

## Things to know

- Import CopilotKit from `@copilotkit/react-core/v2` and `@copilotkit/runtime/v2`, not from the package roots.
- Tool handlers are registered once. Inside them, use only the stable store functions and read the list with `getTodos()`, never the `todos` value from the render.
- Every store change goes through `commit` in `useTodos`, which keeps the ref, the state and `localStorage` in sync. Add new mutations the same way.
- Tool handlers return an explicit result string or object. Without one the model tends to call the tool again.
- The webpack block in `next.config.mjs` stubs `node:` imports that CopilotKit telemetry pulls into the client bundle. Keep it.

## Claude Code hooks

Set in `.claude/settings.json`, scripts in `.claude/hooks/`. They need `jq`.

- `format-on-edit.sh` (PostToolUse): runs Prettier on a `.ts`, `.tsx`, `.js`, `.json` or `.css` file after Claude edits it. Markdown is skipped so the tables in `DESIGN.md` keep their layout.
- `typecheck.sh` (PostToolUse): runs `pnpm exec tsc --noEmit` after Claude edits a `.ts` or `.tsx` file and sends any errors back to Claude.
- `block-forbidden-command.sh` (PreToolUse, Bash): blocks any `git push` to `main`, forced or not. Changes reach `main` through a PR.
- `protect-files.sh` (PreToolUse, Edit/Write): blocks edits to `.env*.local`, `pnpm-lock.yaml` and `package-lock.json`. Env files hold secrets, and lock files change only through pnpm.
- `notify-on-finish.sh` (Stop): shows a macOS notification when Claude finishes.

## MCP servers

Shared in `.mcp.json`: `playwright` (no setup) and `github` (remote server).

- `github` reads the token from the `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable. Set it in your own shell profile before starting Claude Code. Never put the token in `.mcp.json` or commit it.
- Claude Code asks you to approve the project servers the first time. Check them with `/mcp`, not `claude mcp get`, which prints header values in plain text.

## Code conventions

- **Components**: one per file, file name in PascalCase, named export, written as `export const Name: React.FC<NameProps> = (...) => {}`, with `interface NameProps` directly above.
- **Imports**: `@/` for anything outside the current folder, `./` for a file next to it.
- **Styling**: Tailwind utility classes in `className`. No CSS modules and no inline `style`.
- **Comments**: one short line above the code, saying why and not what. Most code has none.

## Git

- The `origin` remote is GitLab, so changes there are reviewed as merge requests.
- GitHub (remote `github`, `huypham-dev/ai-training`) works with the `gh` CLI, logged in as `huypham-dev`. Pull requests there go into `main`, the default branch.
- Branch: `<type>/<short-name>`, like `feat/mcp-config` or `fix/border-button`.
- Commit subject: `<type>: <summary>`, like `feat: add chat components for Copilot integration`.
- Commit or push only when asked.

## Do not guess

Check first, then write. If something cannot be checked, say so and do not present it as fact.

- **Library APIs**: before using a library API, confirm it exists in the installed version, from the type definitions in `node_modules/` or an existing use in `src/`. Most examples online are for other versions than the ones in Stack.
- **Names and paths**: do not make up file paths, exports, props, env variables, scripts or design tokens. Search for an existing one before creating a new one.
- **Unclear requests**: if a request can be read in two ways that lead to different code, ask one short question before writing.
- **Scope**: change only what was asked. Do not add a dependency, a new file type (tests, config, CI) or a refactor without asking first.
- **Verification**: after a code change, run `pnpm build` and report the real result. If the change was not run in the browser, say that it was not.

## UI

Before adding or changing UI, read `DESIGN.md` and follow it. If a change introduces a new visual rule or component, update `DESIGN.md` in the same change.
