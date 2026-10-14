import { Todo } from "@/types/todo";

// Result returned by the clearCompletedTodos copilot action
export interface TodoClearResult {
  cleared: Todo[];
  // Tells the model what happened and what to do next
  note: string;
}

interface TodoClearCardProps {
  // Tool results reach the chat as a JSON string
  result: string;
}

const parseResult = (result: string): TodoClearResult | undefined => {
  try {
    const parsed = JSON.parse(result);
    return Array.isArray(parsed.cleared) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

// Shows the completed tasks that the copilot cleared from the list
export const TodoClearCard: React.FC<TodoClearCardProps> = (props) => {
  const result = parseResult(props.result);

  if (!result) {
    return (
      <div className="rounded-xl border border-danger bg-surface px-4 py-2 text-sm text-danger">
        {props.result || "The completed tasks could not be cleared."}
      </div>
    );
  }

  const { cleared } = result;

  return (
    <div className="rounded-xl border bg-surface px-4 py-2 shadow-card">
      <p className="text-xs font-medium text-ink-muted">
        {cleared.length === 0
          ? "No completed tasks to clear"
          : cleared.length === 1
            ? "1 completed task cleared"
            : `${cleared.length} completed tasks cleared`}
      </p>
      {cleared.length > 0 && (
        <ul className="mt-1">
          {cleared.map((todo) => (
            <li
              key={todo.id}
              className="text-sm text-ink-muted line-through break-words"
            >
              {todo.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
