import { Todo } from "@/types/todo";
import { formatDateRange } from "@/utils/date";

// Result returned by the updateTodoList copilot action
export interface TodoListResult {
  added: Todo[];
  updated: Todo[];
  // Tells the model what happened and what to do next
  note: string;
}

interface TodoAddCardProps {
  // Tool results reach the chat as a JSON string
  result: string;
}

const parseResult = (result: string): TodoListResult | undefined => {
  try {
    const parsed = JSON.parse(result);
    return Array.isArray(parsed.added) && Array.isArray(parsed.updated)
      ? parsed
      : undefined;
  } catch {
    return undefined;
  }
};

const countTasks = (count: number) =>
  count === 1 ? "1 task" : `${count} tasks`;

// Confirms the tasks that the copilot added to the list
export const TodoAddCard: React.FC<TodoAddCardProps> = (props) => {
  const result = parseResult(props.result);

  if (!result) {
    return (
      <div className="rounded-xl border border-danger bg-surface px-4 py-2 text-sm text-danger">
        {props.result || "The todo list could not be updated."}
      </div>
    );
  }

  const { added, updated } = result;

  if (added.length === 0 && updated.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-surface px-4 py-2 shadow-card">
      <p className="flex items-center text-xs font-medium text-primary-strong">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="mr-1 w-4 h-4 shrink-0"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        {added.length > 0
          ? `${countTasks(added.length)} added`
          : `${countTasks(updated.length)} updated`}
      </p>
      {added.length > 0 && (
        <ul className="mt-1">
          {added.map((todo) => {
            const dateRange = formatDateRange(todo.startDate, todo.dueDate);
            return (
              <li key={todo.id} className="text-sm text-ink break-words">
                {todo.text}
                {todo.isImportant && (
                  <span className="ml-2 text-xs font-medium text-accent-strong">
                    Important
                  </span>
                )}
                {dateRange && (
                  <span className="ml-2 text-xs text-ink-muted">
                    {dateRange}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {added.length > 0 && updated.length > 0 && (
        <p className="mt-1 border-t pt-1 text-xs text-ink-muted">
          {countTasks(updated.length)} updated
        </p>
      )}
    </div>
  );
};
