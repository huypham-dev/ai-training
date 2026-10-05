import { Todo, TodoChanges } from "@/types/todo";
import { useState } from "react";
import { InlineInput } from "./InlineInput";

interface TodoItemProps {
  todo: Todo;
  updateTodo: (id: string, changes: TodoChanges) => void;
  deleteTodo: (id: string) => void;
  hasBorder?: boolean;
}

const actionButtonClassName =
  "ml-2 rounded-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  updateTodo,
  deleteTodo,
  hasBorder,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const saveText = (value: string) => {
    const text = value.trim();
    // An empty text keeps the previous one
    if (text !== "" && text !== todo.text) {
      updateTodo(todo.id, { text });
    }
    setIsEditing(false);
  };

  const saveAssignee = (value: string) => {
    // An empty name removes the assignee
    const assignedTo = value.trim() || undefined;
    if (assignedTo !== todo.assignedTo) {
      updateTodo(todo.id, { assignedTo });
    }
    setIsAssigning(false);
  };

  return (
    <div
      className={
        "flex items-center justify-between px-4 py-3 group motion-safe:animate-enter" +
        (hasBorder ? " border-b" : "")
      }
    >
      <div className="flex items-center flex-1 min-w-0">
        <input
          className="h-5 w-5 shrink-0 accent-primary-strong"
          type="checkbox"
          checked={todo.isCompleted}
          aria-label={`Mark "${todo.text}" as completed`}
          onChange={() =>
            updateTodo(todo.id, { isCompleted: !todo.isCompleted })
          }
        />
        {isAssigning ? (
          <InlineInput
            className="ml-2 w-28 shrink-0"
            initialValue={todo.assignedTo ?? ""}
            placeholder="Assignee"
            ariaLabel="Person assigned to this task"
            onSubmit={saveAssignee}
            onCancel={() => setIsAssigning(false)}
          />
        ) : (
          todo.assignedTo && (
            <button
              onClick={() => setIsAssigning(true)}
              title="Change assignee"
              className="ml-2 shrink-0 text-xs rounded-sm border border-secondary/30 bg-secondary/10 px-1.5 py-0.5 font-medium uppercase tracking-wide text-secondary-strong"
            >
              {todo.assignedTo}
            </button>
          )
        )}
        {isEditing ? (
          <InlineInput
            className="ml-2 flex-1 min-w-0"
            initialValue={todo.text}
            ariaLabel="Task text"
            onSubmit={saveText}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to edit"
            className={`ml-2 text-base leading-[1.6] break-words min-w-0 ${
              todo.isCompleted ? "text-ink-muted line-through" : "text-ink"
            }`}
          >
            {todo.text}
          </span>
        )}
      </div>
      <div className="flex items-center shrink-0">
        <button
          onClick={() => setIsEditing(true)}
          aria-label="Edit task"
          title="Edit task"
          className={`${actionButtonClassName} text-ink-muted`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        </button>
        <button
          onClick={() => setIsAssigning(true)}
          aria-label="Assign person"
          title="Assign person"
          className={`${actionButtonClassName} text-primary-strong`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
            />
          </svg>
        </button>
        <button
          onClick={() => deleteTodo(todo.id)}
          aria-label="Delete task"
          title="Delete task"
          className={`${actionButtonClassName} text-danger`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
