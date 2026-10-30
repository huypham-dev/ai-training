import { useCallback, useState } from "react";
import { RemovedTodo, TodoStore } from "./useTodos";

export interface PendingUndo {
  // Changes with every delete or clear, so the countdown starts over
  id: number;
  message: string;
  removed: RemovedTodo[];
}

const clearedMessage = (count: number) =>
  count === 1 ? "1 task cleared" : `${count} tasks cleared`;

// Makes every delete and clear of the store undoable, the latest one only
export const useUndo = (store: TodoStore) => {
  const { getTodos, deleteTodo, clearCompletedTodos, restoreTodos } = store;
  const [pending, setPending] = useState<PendingUndo>();

  const offerUndo = useCallback((message: string, removed: RemovedTodo[]) => {
    if (removed.length === 0) {
      return;
    }
    setPending((current) => ({
      id: (current?.id ?? 0) + 1,
      message,
      removed,
    }));
  }, []);

  // Stable, so copilot tool handlers that are registered once can call them
  const deleteWithUndo = useCallback(
    (id: string) => {
      const todo = getTodos().find((todo) => todo.id === id);
      const removed = deleteTodo(id);
      if (todo) {
        offerUndo(`Task "${todo.text}" deleted`, removed);
      }
      return removed;
    },
    [getTodos, deleteTodo, offerUndo],
  );

  const clearCompletedWithUndo = useCallback(() => {
    const removed = clearCompletedTodos();
    offerUndo(clearedMessage(removed.length), removed);
    return removed;
  }, [clearCompletedTodos, offerUndo]);

  const dismiss = useCallback(() => setPending(undefined), []);

  const undo = useCallback(() => {
    if (pending) {
      restoreTodos(pending.removed);
    }
    setPending(undefined);
  }, [pending, restoreTodos]);

  const undoableStore: TodoStore = {
    ...store,
    deleteTodo: deleteWithUndo,
    clearCompletedTodos: clearCompletedWithUndo,
  };

  return { store: undoableStore, pending, undo, dismiss };
};
