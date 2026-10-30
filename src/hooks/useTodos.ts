import { Todo, TodoChanges } from "@/types/todo";
import { isIsoDate } from "@/utils/date";
import { moveTodoBlock } from "@/utils/todoOrder";
import { withDescendants } from "@/utils/todoTree";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

const STORAGE_KEY = "todos";

// Typed as `Todo[]`, so the build fails when the schema and the type drift apart
const storedTodosSchema: z.ZodType<Todo[]> = z.array(
  z.object({
    id: z.string(),
    text: z.string(),
    isCompleted: z.boolean(),
    assignedTo: z.string().optional(),
    parentId: z.string().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
  }),
);

// Storage can be blocked or hold data from an older version, so a list that
// cannot be read counts as no saved list
const loadTodos = (): Todo[] | undefined => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return undefined;
    }
    const parsed = storedTodosSchema.safeParse(JSON.parse(stored));
    if (!parsed.success) {
      return undefined;
    }
    // Older versions saved any date, such as year 275760, so those are dropped
    return parsed.data.map((todo) => ({
      ...todo,
      startDate:
        todo.startDate && isIsoDate(todo.startDate) ? todo.startDate : undefined,
      dueDate: todo.dueDate && isIsoDate(todo.dueDate) ? todo.dueDate : undefined,
    }));
  } catch {
    return undefined;
  }
};

const saveTodos = (todos: Todo[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // The list still works in memory when storage is full or blocked
  }
};

// A removed task and where it was in the list, so Undo can put it back there
export interface RemovedTodo {
  todo: Todo;
  index: number;
}

export interface TodoStore {
  todos: Todo[];
  // Reads the latest list, also between two renders
  getTodos: () => Todo[];
  addTodo: (text: string) => void;
  updateTodo: (id: string, changes: TodoChanges) => void;
  // Removes the item with all its sub-tasks and returns the removed ones
  deleteTodo: (id: string) => RemovedTodo[];
  // Replaces the items that already exist and appends the others
  upsertTodos: (items: Todo[]) => void;
  // Removes every completed item with all its sub-tasks and returns the removed ones
  clearCompletedTodos: () => RemovedTodo[];
  // Puts removed items back at their old index, skipping ids already on the list
  restoreTodos: (removed: RemovedTodo[]) => void;
  // Moves a task and its sub-tasks to the place of another task with the same parent
  moveTodo: (activeId: string, overId: string) => void;
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
    saveTodos(todosRef.current);
  }, []);

  // The server has no storage, so the saved list is loaded after the first
  // render. It skips `commit`, which would write the same list straight back
  useEffect(() => {
    const storedTodos = loadTodos();
    if (storedTodos) {
      todosRef.current = storedTodos;
      setTodos(storedTodos);
    }
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

  const removeWithDescendants = useCallback(
    (rootIds: string[]): RemovedTodo[] => {
      const ids = withDescendants(todosRef.current, rootIds);
      const removed = todosRef.current.flatMap((todo, index) =>
        ids.has(todo.id) ? [{ todo, index }] : [],
      );
      if (removed.length > 0) {
        commit((todos) => todos.filter((todo) => !ids.has(todo.id)));
      }
      return removed;
    },
    [commit],
  );

  const deleteTodo = useCallback(
    (id: string) =>
      todosRef.current.some((todo) => todo.id === id)
        ? removeWithDescendants([id])
        : [],
    [removeWithDescendants],
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

  const clearCompletedTodos = useCallback(
    () =>
      removeWithDescendants(
        todosRef.current
          .filter((todo) => todo.isCompleted)
          .map((todo) => todo.id),
      ),
    [removeWithDescendants],
  );

  const restoreTodos = useCallback(
    (removed: RemovedTodo[]) => {
      commit((todos) => {
        const newTodos = [...todos];
        // In index order, so earlier items are back before later ones land
        const sorted = [...removed].sort((a, b) => a.index - b.index);
        for (const { todo, index } of sorted) {
          if (!newTodos.some((existing) => existing.id === todo.id)) {
            newTodos.splice(Math.min(index, newTodos.length), 0, todo);
          }
        }
        return newTodos;
      });
    },
    [commit],
  );

  const moveTodo = useCallback(
    (activeId: string, overId: string) => {
      commit((todos) => moveTodoBlock(todos, activeId, overId));
    },
    [commit],
  );

  return {
    todos,
    getTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    upsertTodos,
    clearCompletedTodos,
    restoreTodos,
    moveTodo,
  };
};
