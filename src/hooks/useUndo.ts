import { useCallback, useState } from "react";
import { RemovedTodo } from "./useTodos";

export interface UndoNotice {
  // A new id restarts the countdown of the notice that replaces the old one
  id: number;
  message: string;
  removed: RemovedTodo[];
}

export type OfferUndo = (message: string, removed: RemovedTodo[]) => void;

export const deletedMessage = (text: string) => `Task "${text}" deleted`;

export const clearedMessage = (count: number) =>
  count === 1 ? "1 task cleared" : `${count} tasks cleared`;

// Keeps only the latest delete or clear, in memory, so a reload drops it
export const useUndo = (restoreTodos: (removed: RemovedTodo[]) => void) => {
  const [notice, setNotice] = useState<UndoNotice>();

  // Stable, so copilot tool handlers that are registered once can call it
  const offerUndo: OfferUndo = useCallback((message, removed) => {
    if (removed.length === 0) {
      return;
    }
    setNotice((current) => ({
      id: (current?.id ?? 0) + 1,
      message,
      removed,
    }));
  }, []);

  const dismiss = useCallback(() => setNotice(undefined), []);

  const undo = useCallback(() => {
    if (notice) {
      restoreTodos(notice.removed);
    }
    setNotice(undefined);
  }, [notice, restoreTodos]);

  return { notice, offerUndo, undo, dismiss };
};
