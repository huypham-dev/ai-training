import { TodoAddCard, TodoListResult } from "@/components/chat/TodoAddCard";
import {
  TodoDeleteCard,
  TodoDeleteResult,
} from "@/components/chat/TodoDeleteCard";
import {
  TodoUpdateCard,
  TodoUpdateResult,
} from "@/components/chat/TodoUpdateCard";
import { ToolProgress } from "@/components/chat/ToolProgress";
import { Todo, TodoChanges } from "@/types/todo";
import { getToday, isIsoDate } from "@/utils/date";
import {
  ToolCallStatus,
  useAgentContext,
  useConfigureSuggestions,
  useFrontendTool,
  useHumanInTheLoop,
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
        startDate: z
          .string()
          .optional()
          .describe(
            "The date the work starts, as YYYY-MM-DD. Leave it out to keep the current date, pass an empty string to remove it.",
          ),
        dueDate: z
          .string()
          .optional()
          .describe(
            "The date the todo item is due, as YYYY-MM-DD. Leave it out to keep the current date, pass an empty string to remove it.",
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
  startDate: z
    .string()
    .optional()
    .describe(
      "The new start date, as YYYY-MM-DD. Pass an empty string to remove it.",
    ),
  dueDate: z
    .string()
    .optional()
    .describe(
      "The new due date, as YYYY-MM-DD. Pass an empty string to remove it.",
    ),
});

const deleteTodoParameters = z.object({
  id: z.string().describe("The id of the todo item to delete."),
});

// The model tends to leave a date out when it sends an item again, so only an
// empty string removes it. A value that is not a date keeps the current one
const resolveDate = (value: string | undefined, current: string | undefined) => {
  if (value === undefined || (value !== "" && !isIsoDate(value))) {
    return current;
  }
  return value || undefined;
};

const invalidDateError = (value: string) =>
  `"${value}" is not a date in the format YYYY-MM-DD.`;

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

  // The model does not know the date, and needs it for "tomorrow" or "Friday"
  useAgentContext({
    description: "Today's date, as YYYY-MM-DD.",
    value: getToday(),
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
    handler: async ({ items }): Promise<TodoListResult> => {
      const previousTodos = getTodos();
      // The model tends to leave `parentId` out when it sends a sub-task again
      const todos = items.map((item) => {
        const previous = previousTodos.find((todo) => todo.id === item.id);
        return {
          ...item,
          parentId: item.parentId ?? previous?.parentId,
          startDate: resolveDate(item.startDate, previous?.startDate),
          dueDate: resolveDate(item.dueDate, previous?.dueDate),
        };
      });
      upsertTodos(todos);

      const isNew = (item: Todo) =>
        !previousTodos.some((todo) => todo.id === item.id);
      return {
        added: todos.filter(isNew),
        updated: todos.filter((item) => !isNew(item)),
        // Without an explicit result the model tends to call the tool again
        note:
          `Saved ${items.length} todo item(s). The list now has ${getTodos().length} item(s). ` +
          "The request is done, do not call this tool again for it.",
      };
    },
    render: ({ status, result }) =>
      status === ToolCallStatus.Complete ? (
        <TodoAddCard result={result} />
      ) : (
        <ToolProgress label="Updating the todo list..." />
      ),
  });

  useFrontendTool({
    name: "updateTodo",
    description:
      "Update a single existing todo item: rename it, mark it as completed or not, " +
      "change who it is assigned to, or set its start date and due date. " +
      "Only pass the fields that change.",
    parameters: updateTodoParameters,
    handler: async ({
      id,
      text,
      isCompleted,
      assignedTo,
      startDate,
      dueDate,
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
      if (startDate !== undefined) {
        if (startDate !== "" && !isIsoDate(startDate)) {
          return { error: invalidDateError(startDate) };
        }
        changes.startDate = startDate || undefined;
      }
      if (dueDate !== undefined) {
        if (dueDate !== "" && !isIsoDate(dueDate)) {
          return { error: invalidDateError(dueDate) };
        }
        changes.dueDate = dueDate || undefined;
      }

      const updatedTodo = { ...todo, ...changes };
      if (
        updatedTodo.startDate &&
        updatedTodo.dueDate &&
        updatedTodo.dueDate < updatedTodo.startDate
      ) {
        return { error: "The due date is before the start date." };
      }

      updateTodo(id, changes);
      return { previous: todo, todo: updatedTodo };
    },
    render: ({ status, result }) =>
      status === ToolCallStatus.Complete ? (
        <TodoUpdateCard result={result} />
      ) : (
        <ToolProgress label="Updating the task..." />
      ),
  });

  // This tool has no handler: the run waits for the user to answer in the
  // card, and the item is only deleted when they confirm
  useHumanInTheLoop({
    name: "deleteTodo",
    description:
      "Delete a todo item. The user is asked to confirm, so do not ask them " +
      "yourself before calling this tool.",
    parameters: deleteTodoParameters,
    render: (props) => {
      if (props.status === ToolCallStatus.InProgress) {
        return <ToolProgress label="Deleting a todo item..." />;
      }
      if (props.status === ToolCallStatus.Complete) {
        return <TodoDeleteCard result={props.result} />;
      }

      const { args, respond } = props;
      const findTodo = () => getTodos().find((todo) => todo.id === args.id);

      const answer = (isConfirmed: boolean) => {
        // Look the item up again, it can have changed while the card was open
        const todo = findTodo();
        let result: TodoDeleteResult;
        if (!todo) {
          result = {
            deleted: false,
            note: `No todo item found with id "${args.id}".`,
          };
        } else if (isConfirmed) {
          deleteTodo(todo.id);
          result = {
            deleted: true,
            text: todo.text,
            note: "The user confirmed and the todo item was deleted.",
          };
        } else {
          result = {
            deleted: false,
            text: todo.text,
            note: "The user declined. The todo item was kept, do not try to delete it again.",
          };
        }
        respond(result);
      };

      return <TodoDeleteCard todo={findTodo()} onAnswer={answer} />;
    },
  });
};
