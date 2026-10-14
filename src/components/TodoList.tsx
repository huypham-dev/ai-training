"use client";

import { useAskCopilot } from "@/hooks/useAskCopilot";
import { useTodoCopilot } from "@/hooks/useTodoCopilot";
import { useTodos } from "@/hooks/useTodos";
import { Todo } from "@/types/todo";
import { AddTodoForm } from "./AddTodoForm";
import { TodoItem } from "./TodoItem";
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

  useTodoCopilot(store);
  const { askCopilot, isBusy } = useAskCopilot();

  const breakDownTodo = (todo: Todo) => {
    askCopilot(
      `Break down the task "${todo.text}" (id "${todo.id}") into a few smaller ` +
        `tasks and add them to my todo list with "${todo.id}" as their parentId.`,
    );
  };

  const groupedTodos = groupByParent(todos);
  const completedCount = todos.filter((todo) => todo.isCompleted).length;
  const activeCount = todos.length - completedCount;

  return (
    <div>
      <AddTodoForm addTodo={addTodo} />
      <TodoSuggestions askCopilot={askCopilot} isBusy={isBusy} />
      {todos.length > 0 && (
        <p className="mb-2 text-xs text-ink-muted" aria-live="polite">
          {activeCount} left · {completedCount} done
        </p>
      )}
      {todos.length > 0 && (
        <div className="flex flex-col gap-3">
          {groupedTodos.map((todo) => (
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
