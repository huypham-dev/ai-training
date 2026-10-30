"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAskCopilot } from "@/hooks/useAskCopilot";
import { useTodoCopilot } from "@/hooks/useTodoCopilot";
import { useTodos } from "@/hooks/useTodos";
import { useUndo } from "@/hooks/useUndo";
import { Todo } from "@/types/todo";
import { childrenByParent } from "@/utils/todoTree";
import { APP_TITLE, formatTabTitle } from "@/utils/title";
import { AddTodoForm } from "./AddTodoForm";
import { TodoItem } from "./TodoItem";
import { TodoSearch } from "./TodoSearch";
import { TodoStatus, TodoStatusFilter } from "./TodoStatusFilter";
import { TodoSuggestions } from "./TodoSuggestions";
import { UndoNotice } from "./UndoNotice";

// Puts every sub-task right below the task it was broken down from
const groupByParent = (todos: Todo[]): Todo[] => {
  const ids = new Set(todos.map((todo) => todo.id));
  const children = childrenByParent(todos);
  const visited = new Set<string>();

  const withSubTasks = (todo: Todo): Todo[] => {
    if (visited.has(todo.id)) {
      return [];
    }
    visited.add(todo.id);
    return [
      todo,
      ...(children.get(todo.id) ?? []).flatMap(withSubTasks),
    ];
  };

  const grouped = todos
    .filter((todo) => !todo.parentId || !ids.has(todo.parentId))
    .flatMap(withSubTasks);
  // Tasks that are each other's parent have no top-level task to hang under
  return [...grouped, ...todos.filter((todo) => !visited.has(todo.id))];
};

// Keeps the tasks above a matching sub-task, so it never shows without its parent
const filterWithAncestors = (
  todos: Todo[],
  isMatch: (todo: Todo) => boolean,
): Todo[] => {
  const byId = new Map(todos.map((todo) => [todo.id, todo]));
  const visibleIds = new Set<string>();
  for (const todo of todos.filter(isMatch)) {
    let current: Todo | undefined = todo;
    while (current && !visibleIds.has(current.id)) {
      visibleIds.add(current.id);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
  }
  return todos.filter((todo) => visibleIds.has(todo.id));
};

export const TodoList: React.FC = () => {
  const { store, pending, undo, dismiss } = useUndo(useTodos());
  const { todos, addTodo, updateTodo, deleteTodo, clearCompletedTodos } = store;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TodoStatus>("all");
  const rootRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useTodoCopilot(store);
  const { askCopilot, isBusy } = useAskCopilot();

  const breakDownTodo = (todo: Todo) => {
    askCopilot(
      `Break down the task "${todo.text}" (id "${todo.id}") into a few smaller ` +
        `tasks and add them to my todo list with "${todo.id}" as their parentId.`,
    );
  };

  // The pressed button goes away with the notice, so the focus moves to the list
  const keepFocus = (close: () => void) => {
    const hadFocus = noticeRef.current?.contains(document.activeElement);
    close();
    if (hadFocus) {
      rootRef.current?.focus();
    }
  };
  const undoNotice = useCallback(() => keepFocus(undo), [undo]);
  const dismissNotice = useCallback(() => keepFocus(dismiss), [dismiss]);

  const query = search.trim().toLowerCase();
  const groupedTodos = groupByParent(todos);
  const isFiltered = query !== "" || status !== "all";
  const visibleTodos = isFiltered
    ? filterWithAncestors(
        groupedTodos,
        (todo) =>
          todo.text.toLowerCase().includes(query) &&
          (status === "all" || todo.isCompleted === (status === "done")),
      )
    : groupedTodos;
  const statusLabel = { all: "", active: "active ", done: "completed " }[status];
  const emptyMessage =
    query === ""
      ? `No ${statusLabel}todos`
      : `No ${statusLabel}todos match "${search.trim()}"`;
  const completedCount = todos.filter((todo) => todo.isCompleted).length;
  const activeCount = todos.length - completedCount;

  useEffect(() => {
    document.title = formatTabTitle(activeCount);
    return () => {
      document.title = APP_TITLE;
    };
  }, [activeCount]);

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className="flex flex-1 flex-col outline-none"
    >
      <AddTodoForm addTodo={addTodo} />
      <TodoSuggestions askCopilot={askCopilot} isBusy={isBusy} />
      <TodoSearch value={search} onChange={setSearch} />
      <TodoStatusFilter value={status} onChange={setStatus} />
      {todos.length > 0 && (
        <div className="mb-2 flex items-center gap-3">
          <p className="text-xs text-ink-muted" aria-live="polite">
            {activeCount} left · {completedCount} done · {todos.length} total
          </p>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={clearCompletedTodos}
              className="rounded-sm text-xs font-medium text-ink-muted transition duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Clear completed
            </button>
          )}
        </div>
      )}
      {/* Kept mounted so screen readers announce the text when it appears */}
      <p className="text-sm text-ink-muted empty:hidden" aria-live="polite">
        {isFiltered && visibleTodos.length === 0 && emptyMessage}
      </p>
      {visibleTodos.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              parent={todos.find(
                (parent) => parent.id === todo.parentId && parent.id !== todo.id,
              )}
              updateTodo={updateTodo}
              deleteTodo={deleteTodo}
              breakDownTodo={breakDownTodo}
              isCopilotBusy={isBusy}
            />
          ))}
        </div>
      )}
      {/* Kept mounted and shown, so screen readers announce what appears */}
      <div
        ref={noticeRef}
        className="sticky bottom-6 mt-auto"
        aria-live="polite"
      >
        {pending && (
          <UndoNotice
            id={pending.id}
            message={pending.message}
            onUndo={undoNotice}
            onDismiss={dismissNotice}
          />
        )}
      </div>
    </div>
  );
};
