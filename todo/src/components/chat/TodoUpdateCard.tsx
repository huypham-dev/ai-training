import { Todo } from "@/types/todo";
import { formatDate } from "@/utils/date";

// Result returned by the updateTodo copilot action
export type TodoUpdateResult =
  | { previous: Todo; todo: Todo }
  | { error: string };

interface TodoUpdateCardProps {
  // Tool results reach the chat as a JSON string
  result: string;
}

const parseResult = (result: string): TodoUpdateResult => {
  try {
    return JSON.parse(result);
  } catch {
    return { error: result || "The task could not be updated." };
  }
};

const ChangeRow: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <li className="flex items-baseline text-xs">
    <span className="w-16 shrink-0 text-ink-muted">{label}</span>
    <span className="min-w-0 break-words text-ink">{children}</span>
  </li>
);

export const TodoUpdateCard: React.FC<TodoUpdateCardProps> = (props) => {
  const result = parseResult(props.result);

  if ("error" in result) {
    return (
      <div className="rounded-xl border border-danger bg-surface px-4 py-2 text-sm text-danger">
        {result.error}
      </div>
    );
  }

  const { previous, todo } = result;

  return (
    <div className="rounded-xl border bg-surface px-4 py-2 shadow-card">
      <p className="text-xs font-medium text-primary-strong">Task updated</p>
      <p className="text-sm text-ink break-words">{todo.text}</p>
      <ul className="mt-1 border-t pt-1">
        {previous.text !== todo.text && (
          <ChangeRow label="Renamed">
            <span className="text-ink-muted line-through">{previous.text}</span>
          </ChangeRow>
        )}
        {previous.isCompleted !== todo.isCompleted && (
          <ChangeRow label="Status">
            {todo.isCompleted ? "Completed" : "Reopened"}
          </ChangeRow>
        )}
        {previous.assignedTo !== todo.assignedTo && (
          <ChangeRow label="Assignee">
            {todo.assignedTo ? (
              <span className="rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-0.5 font-medium text-secondary-strong">
                {todo.assignedTo}
              </span>
            ) : (
              "Unassigned"
            )}
          </ChangeRow>
        )}
        {previous.startDate !== todo.startDate && (
          <ChangeRow label="Start">
            {todo.startDate ? formatDate(todo.startDate) : "Removed"}
          </ChangeRow>
        )}
        {previous.dueDate !== todo.dueDate && (
          <ChangeRow label="Due">
            {todo.dueDate ? formatDate(todo.dueDate) : "Removed"}
          </ChangeRow>
        )}
      </ul>
    </div>
  );
};
