import {
  TodoUpdateCard,
  TodoUpdateResult,
} from "@/components/chat/TodoUpdateCard";
import { ToolProgress } from "@/components/chat/ToolProgress";
import { TodoChanges } from "@/types/todo";
import {
  ToolCallStatus,
  useAgentContext,
  useConfigureSuggestions,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { TodoStore } from "./useTodos";

const updateTodoListParameters = z.object({
  items: z
    .array(
      z.object({
        id: z
          .string()
          .describe(
            "The id of the todo item. When creating a new todo item, just make up a new id.",
          ),
        text: z.string().describe("The text of the todo item."),
        isCompleted: z
          .boolean()
          .describe("The completion status of the todo item."),
        assignedTo: z
          .string()
          .describe(
            "The person assigned to the todo item. If you don't know, assign it to 'YOU'.",
          ),
        parentId: z
          .string()
          .optional()
          .describe(
            "The id of the todo item this one was broken down from. Only set it for a sub-task.",
          ),
      }),
    )
    .describe("The new and updated todo list items."),
});

const updateTodoParameters = z.object({
  id: z.string().describe("The id of the todo item to update."),
  text: z.string().optional().describe("The new text of the todo item."),
  isCompleted: z
    .boolean()
    .optional()
    .describe("The new completion status of the todo item."),
  assignedTo: z
    .string()
    .optional()
    .describe(
      "The person newly assigned to the todo item. Pass an empty string to unassign it.",
    ),
});

const deleteTodoParameters = z.object({
  id: z.string().describe("The id of the todo item to delete."),
});

// Defined outside the hook, so the suggestions are not reloaded on every render
const emptyListSuggestions = {
  available: "before-first-message" as const,
  suggestions: [
    {
      title: "Plan my day",
      message: "Help me plan my day. Add a few tasks to my todo list.",
    },
    {
      title: "Add a grocery run",
      message: "Add the tasks for a grocery run to my todo list.",
    },
    {
      title: "Break down a goal",
      message:
        "I have a goal. Ask me what it is, then break it down into tasks.",
    },
  ],
};

const filledListSuggestions = {
  available: "before-first-message" as const,
  suggestions: [
    {
      title: "What is left to do?",
      message: "Which tasks on my todo list are still open?",
    },
    {
      title: "Mark everything as done",
      message: "Mark all tasks on my todo list as completed.",
    },
    {
      title: "Remove completed tasks",
      message: "Delete all completed tasks from my todo list.",
    },
  ],
};

const followUpSuggestions = {
  available: "after-first-message" as const,
  instructions:
    "Suggest short next steps for managing the user's todo list, based on the " +
    "items that are on it now: for example completing, assigning, renaming or " +
    "removing a specific item, or adding tasks that are still missing for a goal. " +
    "Keep each title under 30 characters.",
  maxSuggestions: 1,
};

// Connects the todo list to the copilot: the agent can read the list and
// change it through the tools below
export const useTodoCopilot = ({
  todos,
  getTodos,
  updateTodo,
  deleteTodo,
  upsertTodos,
}: TodoStore) => {
  useAgentContext({
    description: "The user's todo list.",
    value: JSON.stringify(todos),
  });

  // The starter prompts depend on whether there is something to manage yet
  useConfigureSuggestions(
    todos.length === 0 ? emptyListSuggestions : filledListSuggestions,
  );
  useConfigureSuggestions(followUpSuggestions);

  // Tool handlers are registered once, so they must only use the stable
  // functions of the store and read the list through `getTodos`

  useFrontendTool({
    name: "updateTodoList",
    description: "Update the users todo list",
    parameters: updateTodoListParameters,
    handler: async ({ items }) => {
      // The model tends to leave `parentId` out when it sends a sub-task again
      upsertTodos(
        items.map((item) => ({
          ...item,
          parentId:
            item.parentId ??
            getTodos().find((todo) => todo.id === item.id)?.parentId,
        })),
      );
      // Without an explicit result the model tends to call the tool again
      return (
        `Saved ${items.length} todo item(s). The list now has ${getTodos().length} item(s). ` +
        "The request is done, do not call this tool again for it."
      );
    },
    render: ({ status }) =>
      status === ToolCallStatus.Complete ? null : (
        <ToolProgress label="Updating the todo list..." />
      ),
  });

  useFrontendTool({
    name: "updateTodo",
    description:
      "Update a single existing todo item: rename it, mark it as completed or not, " +
      "or change who it is assigned to. Only pass the fields that change.",
    parameters: updateTodoParameters,
    handler: async ({
      id,
      text,
      isCompleted,
      assignedTo,
    }): Promise<TodoUpdateResult> => {
      const todo = getTodos().find((todo) => todo.id === id);
      if (!todo) {
        return { error: `No todo item found with id "${id}".` };
      }

      const changes: TodoChanges = {};
      if (text !== undefined && text.trim() !== "") {
        changes.text = text.trim();
      }
      if (isCompleted !== undefined) {
        changes.isCompleted = isCompleted;
      }
      if (assignedTo !== undefined) {
        changes.assignedTo = assignedTo.trim() || undefined;
      }

      updateTodo(id, changes);
      return { previous: todo, todo: { ...todo, ...changes } };
    },
    render: ({ status, result }) =>
      status === ToolCallStatus.Complete ? (
        <TodoUpdateCard result={result} />
      ) : (
        <ToolProgress label="Updating the task..." />
      ),
  });

  useFrontendTool({
    name: "deleteTodo",
    description: "Delete a todo item",
    parameters: deleteTodoParameters,
    handler: async ({ id }) => {
      deleteTodo(id);
      return "Todo item deleted.";
    },
    render: ({ status }) =>
      status === ToolCallStatus.Complete ? null : (
        <ToolProgress label="Deleting a todo item..." />
      ),
  });
};
