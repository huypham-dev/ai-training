import { Todo, TodoChanges } from "@/types/todo";
import { nanoid } from "nanoid";
import { useCallback, useRef, useState } from "react";

export interface TodoStore {
  todos: Todo[];
  // Reads the latest list, also between two renders
  getTodos: () => Todo[];
  addTodo: (text: string) => void;
  updateTodo: (id: string, changes: TodoChanges) => void;
  deleteTodo: (id: string) => void;
  // Replaces the items that already exist and appends the others
  upsertTodos: (items: Todo[]) => void;
  // Removes every completed item and returns the removed ones
  clearCompletedTodos: () => Todo[];
}

export const useTodos = (): TodoStore => {
  const [todos, setTodos] = useState<Todo[]>([]);

  // Every change goes through `commit`, so the ref is always the latest list.
  // This keeps the functions below stable and safe to call from copilot tools,
  // which are registered once and can run several times before the next render.
  const todosRef = useRef(todos);

  const commit = useCallback((update: (todos: Todo[]) => Todo[]) => {
    todosRef.current = update(todosRef.current);
    setTodos(todosRef.current);
  }, []);

  const getTodos = useCallback(() => todosRef.current, []);

  const addTodo = useCallback(
    (text: string) => {
      const trimmedText = text.trim();
      if (trimmedText === "") {
        return;
      }
      commit((todos) => [
        ...todos,
        { id: nanoid(), text: trimmedText, isCompleted: false },
      ]);
    },
    [commit],
  );

  const updateTodo = useCallback(
    (id: string, changes: TodoChanges) => {
      commit((todos) =>
        todos.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo)),
      );
    },
    [commit],
  );

  const deleteTodo = useCallback(
    (id: string) => {
      commit((todos) => todos.filter((todo) => todo.id !== id));
    },
    [commit],
  );

  const upsertTodos = useCallback(
    (items: Todo[]) => {
      commit((todos) => {
        const newTodos = [...todos];
        for (const item of items) {
          const existingItemIndex = newTodos.findIndex(
            (todo) => todo.id === item.id,
          );
          if (existingItemIndex !== -1) {
            newTodos[existingItemIndex] = item;
          } else {
            newTodos.push(item);
          }
        }
        return newTodos;
      });
    },
    [commit],
  );

  const clearCompletedTodos = useCallback(() => {
    const cleared = todosRef.current.filter((todo) => todo.isCompleted);
    commit((todos) => todos.filter((todo) => !todo.isCompleted));
    return cleared;
  }, [commit]);

  return {
    todos,
    getTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    upsertTodos,
    clearCompletedTodos,
  };
};
