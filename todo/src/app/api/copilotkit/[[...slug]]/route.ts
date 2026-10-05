import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: "openai/gpt-4o-mini",
      prompt:
        "Help the user manage a todo list. If the user provides a high level goal, " +
        "break it down into a few specific tasks and add them to the list. " +
        "To change a single existing task, use the updateTodo tool. " +
        "Once a tool call has succeeded, confirm it to the user in a short message " +
        "and never repeat that tool call.",
    }),
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
