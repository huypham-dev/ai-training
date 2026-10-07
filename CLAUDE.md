# CLAUDE.md

## Project

A training repo for building AI features. It holds one app, `todo/`: a Next.js todo list with an embedded CopilotKit chat that can read and change the list.

## Commands

Run from `todo/` with pnpm.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # also the type check
```

- The chat needs `OPENAI_API_KEY` in `todo/.env.local`.
- There are no tests, and ESLint is not set up.

## Stack

Next.js 14 (App Router), React 18, TypeScript strict, Tailwind CSS 4 (tokens in `@theme` in `globals.css`, no `tailwind.config.js`), CopilotKit 1.77 (v2 entry points), zod 4.

## Architecture

All paths are under `todo/src/`.

- Todos live in React state inside `hooks/useTodos.ts`, which also saves them to `localStorage` (key `todos`) and loads them back after mount. The chat history is not saved, so a reload clears it.
- `components/TodoList.tsx` creates the store and passes it to `hooks/useTodoCopilot.tsx`, which shares the list with the agent (`useAgentContext`) and registers four frontend tools: `updateTodoList` (upsert many), `updateTodo` (change one), `deleteTodo` and `clearCompletedTodos` (remove all completed).
- The agent runs on the server in `app/api/copilotkit/[[...slug]]/route.ts`. The tools run in the browser and change the store.
- `components/chat/` holds the custom chat slot components, and `components/copilot/` holds the CopilotKit provider and popup wrappers.

## Things to know

- Import CopilotKit from `@copilotkit/react-core/v2` and `@copilotkit/runtime/v2`, not from the package roots.
- Tool handlers are registered once. Inside them, use only the stable store functions and read the list with `getTodos()`, never the `todos` value from the render.
- Every store change goes through `commit` in `useTodos`, which keeps the ref, the state and `localStorage` in sync. Add new mutations the same way.
- Tool handlers return an explicit result string or object. Without one the model tends to call the tool again.
- The webpack block in `next.config.mjs` stubs `node:` imports that CopilotKit telemetry pulls into the client bundle. Keep it.

## Code conventions

- **Components**: one per file, file name in PascalCase, named export, written as `export const Name: React.FC<NameProps> = (...) => {}`, with `interface NameProps` directly above.
- **Imports**: `@/` for anything outside the current folder, `./` for a file next to it.
- **Styling**: Tailwind utility classes in `className`. No CSS modules and no inline `style`.
- **Comments**: one short line above the code, saying why and not what. Most code has none.

## Git

- The remote is GitLab, so changes are reviewed as merge requests. The `gh` CLI does not work here.
- Branch: `<type>/<short-name>`, like `feat/todo-app`.
- Commit subject: `<type>: <summary>`, like `feat: add chat components for Copilot integration`.
- Commit or push only when asked.

## Do not guess

Check first, then write. If something cannot be checked, say so and do not present it as fact.

- **Library APIs**: before using a library API, confirm it exists in the installed version, from the type definitions in `todo/node_modules/` or an existing use in `todo/src/`. Most examples online are for other versions than the ones in Stack.
- **Names and paths**: do not make up file paths, exports, props, env variables, scripts or design tokens. Search for an existing one before creating a new one.
- **Unclear requests**: if a request can be read in two ways that lead to different code, ask one short question before writing.
- **Scope**: change only what was asked. Do not add a dependency, a new file type (tests, config, CI) or a refactor without asking first.
- **Verification**: after a code change, run `pnpm build` in `todo/` and report the real result. If the change was not run in the browser, say that it was not.

## UI

Before adding or changing UI in `todo/`, read `todo/DESIGN.md` and follow it. If a change introduces a new visual rule or component, update `todo/DESIGN.md` in the same change.
