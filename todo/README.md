This is a demo that showcases using CopilotKit to build a simple Todo app.

## Run the live demo

Want to see CopilotKit in action? [Try the live demo](https://todo-demo-phi.vercel.app).

## Deploy with Vercel

To deploy with Vercel, click the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCopilotKit%2Fdemo-todo&env=NEXT_PUBLIC_COPILOT_CLOUD_API_KEY&project-name=copilotkit-demo-todo&repository-name=copilotkit-demo-todo)

## How to Build: a To-Do list app with an embedded AI copilot

Learn how to create a To-Do list app with an embedded AI copilot. This tutorial will guide you through the process step-by-step.

Tutorial: [How to Build: a To-Do list app with an embedded AI copilot](https://dev.to/copilotkit/how-to-build-an-ai-powered-to-do-list-nextjs-gpt4-copilotkit-20i4)

## Add your OpenAI API key

Add your environment variables to `.env.local` in the root of the project.

```
OPENAI_API_KEY=your-api-key
```

## Install dependencies

```bash
npm install
```

## Run the development server

```bash
npm run dev
```

## Open the demo

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## The Copilot-Specific parts of the code:

The app uses the CopilotKit v2 APIs (`@copilotkit/react-core/v2` and `@copilotkit/runtime/v2`).

1. Notice `<CopilotKitProvider />` in `components/copilot/CopilotProvider.tsx` (used by `layout.tsx`) and `<CopilotPopup />` in `components/copilot/TodoCopilotPopup.tsx`

2. Notice `useAgentContext` in `hooks/useTodoCopilot.tsx`

3. Notice the 3 `useFrontendTool` in `hooks/useTodoCopilot.tsx`

4. Notice the runtime and its `BuiltInAgent` in `api/copilotkit/[[...slug]]/route.ts`
