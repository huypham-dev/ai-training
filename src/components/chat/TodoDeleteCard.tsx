import { Todo } from "@/types/todo";

// Result returned by the deleteTodo copilot action
export interface TodoDeleteResult {
  deleted: boolean;
  // Missing when the task was not on the list
  text?: string;
  // Tells the model what happened and what to do next
  note: string;
}

interface TodoDeleteCardProps {
  // The task to delete, while the user has not answered yet
  todo?: Todo;
  // Tool results reach the chat as a JSON string
  result?: string;
  onAnswer?: (isConfirmed: boolean) => void;
}

const parseResult = (result: string): TodoDeleteResult => {
  try {
    return JSON.parse(result);
  } catch {
    return { deleted: false, note: result || "The task could not be deleted." };
  }
};

const buttonClassName =
  "ml-2 rounded-xl px-3 py-1 text-sm transition duration-200 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

// Asks the user to confirm a deletion, then shows what they answered
export const TodoDeleteCard: React.FC<TodoDeleteCardProps> = ({
  todo,
  result,
  onAnswer,
}) => {
  if (result !== undefined) {
    const { deleted, text, note } = parseResult(result);

    if (text === undefined) {
      return (
        <div className="rounded-xl border border-danger bg-surface px-4 py-2 text-sm text-danger">
          {note}
        </div>
      );
    }

    return (
      <div className="rounded-xl border bg-surface px-4 py-2 shadow-card">
        <p className="text-xs font-medium text-ink-muted">
          {deleted ? "Task deleted" : "Task kept"}
        </p>
        <p
          className={`text-sm break-words ${
            deleted ? "text-ink-muted line-through" : "text-ink"
          }`}
        >
          {text}
        </p>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-danger bg-surface px-4 py-2 text-sm text-danger">
        <span className="min-w-0 break-words">
          This task is no longer on the list.
        </span>
        <button
          className={`${buttonClassName} shrink-0 border bg-surface font-medium text-ink hover:bg-surface-muted`}
          onClick={() => onAnswer?.(false)}
        >
          OK
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-surface px-4 py-2 shadow-card">
      <p className="text-xs font-medium text-danger">Delete this task?</p>
      <p className="text-sm text-ink break-words">{todo.text}</p>
      <div className="mt-2 flex justify-end border-t pt-2">
        <button
          className={`${buttonClassName} border bg-surface font-medium text-ink hover:bg-surface-muted`}
          onClick={() => onAnswer?.(false)}
        >
          Keep
        </button>
        <button
          className={`${buttonClassName} bg-danger font-semibold text-white hover:shadow-card`}
          onClick={() => onAnswer?.(true)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
