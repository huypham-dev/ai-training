A Next.js todo list with an embedded CopilotKit chat that can read and change the list.

## Stack

Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 4, CopilotKit 1.77 (v2 entry points) and zod 4.

## Environment variables

Add them to `.env.local` in this folder.

```
OPENAI_API_KEY=your-api-key
CPK_INTELLIGENCE_API_KEY=your-intelligence-key
```

- `OPENAI_API_KEY` is required for the chat.
- `CPK_INTELLIGENCE_API_KEY` is optional. It saves chat threads with CopilotKit Intelligence. Without it the chat still works, but the threads drawer stays empty.

## Install dependencies

```bash
pnpm install
```

## Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

```bash
pnpm build
```

The build also runs the type check.

## How it works

The app uses the CopilotKit v2 APIs (`@copilotkit/react-core/v2` and `@copilotkit/runtime/v2`). All paths are under `src/`.

1. Todos live in React state in `hooks/useTodos.ts`, which also saves them to `localStorage`.
2. `<CopilotKitProvider />` in `components/copilot/CopilotProvider.tsx` connects the app to the runtime, and `components/copilot/TodoCopilotChat.tsx` renders the chat.
3. `hooks/useTodoCopilot.tsx` shares the list with the agent through `useAgentContext` and registers four tools that run in the browser:
   - `updateTodoList`: add or replace many items
   - `updateTodo`: change one item
   - `deleteTodo`: delete one item after the user confirms in a card (`useHumanInTheLoop`)
   - `clearCompletedTodos`: remove all completed items
4. The agent runs on the server as a `BuiltInAgent` in `app/api/copilotkit/[[...slug]]/route.ts`.
5. `components/copilot/TodoThreadsDrawer.tsx` lists saved chat threads when `CPK_INTELLIGENCE_API_KEY` is set.
