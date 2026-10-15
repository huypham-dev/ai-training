"use client";

import { useState } from "react";
import { useAskCopilot } from "@/hooks/useAskCopilot";
import { useTodoCopilot } from "@/hooks/useTodoCopilot";
import { useTodos } from "@/hooks/useTodos";
import { Todo } from "@/types/todo";
import { AddTodoForm } from "./AddTodoForm";
import { TodoItem } from "./TodoItem";
import { TodoSearch } from "./TodoSearch";
import { TodoSuggestions } from "./TodoSuggestions";

// Puts every sub-task right below the task it was broken down from
const groupByParent = (todos: Todo[]): Todo[] => {
  const ids = new Set(todos.map((todo) => todo.id));
  const visited = new Set<string>();

  const withSubTasks = (todo: Todo): Todo[] => {
    if (visited.has(todo.id)) {
      return [];
    }
    visited.add(todo.id);
    return [
      todo,
      ...todos.filter((child) => child.parentId === todo.id).flatMap(withSubTasks),
    ];
  };

  const grouped = todos
    .filter((todo) => !todo.parentId || !ids.has(todo.parentId))
    .flatMap(withSubTasks);
  // Tasks that are each other's parent have no top-level task to hang under
  return [...grouped, ...todos.filter((todo) => !visited.has(todo.id))];
};

export const TodoList: React.FC = () => {
  const store = useTodos();
  const { todos, addTodo, updateTodo, deleteTodo } = store;
  const [search, setSearch] = useState("");

  useTodoCopilot(store);
  const { askCopilot, isBusy } = useAskCopilot();

  const breakDownTodo = (todo: Todo) => {
    askCopilot(
      `Break down the task "${todo.text}" (id "${todo.id}") into a few smaller ` +
        `tasks and add them to my todo list with "${todo.id}" as their parentId.`,
    );
  };

  const query = search.trim().toLowerCase();
  const visibleTodos = groupByParent(todos).filter((todo) =>
    todo.text.toLowerCase().includes(query),
  );
  const completedCount = todos.filter((todo) => todo.isCompleted).length;
  const activeCount = todos.length - completedCount;

  return (
    <div>
      <AddTodoForm addTodo={addTodo} />
      <TodoSuggestions askCopilot={askCopilot} isBusy={isBusy} />
      <TodoSearch value={search} onChange={setSearch} />
      {todos.length > 0 && (
        <p className="mb-2 text-xs text-ink-muted" aria-live="polite">
          {activeCount} left · {completedCount} done · {todos.length} total
        </p>
      )}
      {/* Kept mounted so screen readers announce the text when it appears */}
      <p className="text-sm text-ink-muted empty:hidden" aria-live="polite">
        {query !== "" &&
          visibleTodos.length === 0 &&
          `No todos match "${search.trim()}"`}
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
    </div>
  );
};
