import { Todo, TodoChanges } from "@/types/todo";
import {
  MAX_DATE,
  MIN_DATE,
  formatDateRange,
  getToday,
  isIsoDate,
} from "@/utils/date";
import { useState } from "react";
import { InlineInput } from "./InlineInput";

interface TodoItemProps {
  todo: Todo;
  // The task this one was broken down from, if it is still on the list
  parent?: Todo;
  updateTodo: (id: string, changes: TodoChanges) => void;
  deleteTodo: (id: string) => void;
  breakDownTodo: (todo: Todo) => void;
  isCopilotBusy: boolean;
}

const actionButtonClassName =
  "rounded-sm text-ink-muted transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const pillClassName =
  "rounded-full px-2.5 py-0.5 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

type DateField = "startDate" | "dueDate";

const dateInputClassName =
  "ml-2 border rounded-xl px-2 py-1 text-sm text-ink focus:outline-2 focus:outline-offset-2 focus:outline-primary";

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  parent,
  updateTodo,
  deleteTodo,
  breakDownTodo,
  isCopilotBusy,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  // The inputs show what was typed, also while it is not a date that can be saved
  const [draftDates, setDraftDates] = useState({ startDate: "", dueDate: "" });
  const [dateError, setDateError] = useState<string>();

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

  const openScheduling = () => {
    setDraftDates({
      startDate: todo.startDate ?? "",
      dueDate: todo.dueDate ?? "",
    });
    setDateError(undefined);
    setIsScheduling(true);
  };

  const changeDate = (field: DateField, value: string) => {
    const startDate = field === "startDate" ? value : draftDates.startDate;
    const dueDate = field === "dueDate" ? value : draftDates.dueDate;
    setDraftDates({ startDate, dueDate });
    const hasInvalidDate =
      (startDate !== "" && !isIsoDate(startDate)) ||
      (dueDate !== "" && !isIsoDate(dueDate));
    // An invalid date is never saved, the task keeps its previous dates
    if (hasInvalidDate) {
      setDateError("Pick a date between 1900 and 2099.");
      return;
    }
    if (startDate && dueDate && dueDate < startDate) {
      setDateError("The due date is before the start date.");
      return;
    }
    setDateError(undefined);
    updateTodo(todo.id, {
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
    });
  };

  const handleDatesKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsScheduling(false);
    } else if (e.key === "Escape") {
      setIsScheduling(false);
    }
  };

  const dateRange = formatDateRange(todo.startDate, todo.dueDate);
  const isOverdue =
    !todo.isCompleted &&
    todo.dueDate !== undefined &&
    todo.dueDate < getToday();

  const dates = isScheduling ? (
    <div
      className="flex flex-wrap items-center gap-2"
      onKeyDown={handleDatesKeyDown}
      // Close when the focus leaves both inputs, not when it moves between them
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsScheduling(false);
        }
      }}
    >
      <label className="flex items-center text-xs text-ink-muted">
        Start
        <input
          type="date"
          className={dateInputClassName}
          value={draftDates.startDate}
          min={MIN_DATE}
          max={todo.dueDate ?? MAX_DATE}
          aria-invalid={dateError !== undefined}
          autoFocus
          onChange={(e) => changeDate("startDate", e.target.value)}
        />
      </label>
      <label className="flex items-center text-xs text-ink-muted">
        Due
        <input
          type="date"
          className={dateInputClassName}
          value={draftDates.dueDate}
          min={todo.startDate ?? MIN_DATE}
          max={MAX_DATE}
          aria-invalid={dateError !== undefined}
          onChange={(e) => changeDate("dueDate", e.target.value)}
        />
      </label>
      {dateError && (
        <p role="alert" className="w-full text-xs text-danger">
          {dateError}
        </p>
      )}
    </div>
  ) : (
    dateRange && (
      <button
        onClick={openScheduling}
        title="Change dates"
        className={`${pillClassName} flex items-center gap-1 bg-surface-sunken text-ink-muted`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
        {dateRange}
        {isOverdue && <span className="font-medium text-danger">Overdue</span>}
      </button>
    )
  );

  const hasMeta =
    isAssigning || isScheduling || Boolean(todo.assignedTo || dateRange);

  return (
    <div
      className={
        "flex flex-wrap items-start gap-x-3 gap-y-2 rounded-xl border bg-surface p-4 shadow-card motion-safe:animate-enter" +
        (parent ? " ml-8" : "")
      }
    >
      {/* The basis makes the actions wrap below before the text gets too narrow */}
      <div className="flex min-w-0 grow basis-64 items-start">
        {parent && (
          <span
            className="mt-0.5 mr-2 shrink-0 text-ink-muted"
            title={`Sub-task of "${parent.text}"`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.49 12 3.75 3.75m0 0-3.75 3.75m3.75-3.75H3.74V4.499"
              />
            </svg>
            <span className="sr-only">Sub-task of {parent.text}</span>
          </span>
        )}
        <span
          className={`mt-2 mr-3 h-2 w-2 shrink-0 rounded-full ${
            todo.isCompleted ? "bg-line" : "bg-accent"
          }`}
          aria-hidden="true"
        />
        <input
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary-strong"
          type="checkbox"
          checked={todo.isCompleted}
          aria-label={`Mark "${todo.text}" as completed`}
          onChange={() =>
            updateTodo(todo.id, { isCompleted: !todo.isCompleted })
          }
        />
        <div className="ml-3 flex-1 min-w-0">
          {isEditing ? (
            <InlineInput
              className="w-full"
              initialValue={todo.text}
              ariaLabel="Task text"
              onSubmit={saveText}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditing(true)}
              title="Double-click to edit"
              className={`text-base font-semibold leading-[1.6] break-words ${
                todo.isCompleted ? "text-ink-muted line-through" : "text-ink"
              }`}
            >
              {todo.text}
            </span>
          )}
          {hasMeta && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {isAssigning ? (
                <InlineInput
                  className="w-28"
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
                    className={`${pillClassName} border border-secondary/30 bg-secondary/10 font-medium text-secondary-strong`}
                  >
                    {todo.assignedTo}
                  </button>
                )
              )}
              {dates}
            </div>
          )}
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* just show for parent tasks */}
        {!parent && (
          <button
            onClick={() => breakDownTodo(todo)}
            disabled={isCopilotBusy}
            aria-label="Break down with the copilot"
            title="Break down with the copilot"
            className="mr-1 flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-strong transition duration-200 hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
            Break down
          </button>
        )}
        <button
          onClick={() => setIsEditing(true)}
          aria-label="Edit task"
          title="Edit task"
          className={`${actionButtonClassName} hover:text-ink`}
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
          onClick={openScheduling}
          aria-label="Set dates"
          title="Set dates"
          className={`${actionButtonClassName} hover:text-ink`}
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </button>
        <button
          onClick={() => setIsAssigning(true)}
          aria-label="Assign person"
          title="Assign person"
          className={`${actionButtonClassName} hover:text-ink`}
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
          className={`${actionButtonClassName} hover:text-danger`}
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
