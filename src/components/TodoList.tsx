"use client";

import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAskCopilot } from "@/hooks/useAskCopilot";
import { useTodoCopilot } from "@/hooks/useTodoCopilot";
import { useTodos } from "@/hooks/useTodos";
import { useUndo } from "@/hooks/useUndo";
import { Todo } from "@/types/todo";
import { TodoNode, buildTodoTree, groupByParent } from "@/utils/todoOrder";
import { APP_TITLE, formatTabTitle } from "@/utils/title";
import { AddTodoForm } from "./AddTodoForm";
import { DragHandle } from "./DragHandle";
import { SortableTodo, SortableTodoData } from "./SortableTodo";
import { TodoItem } from "./TodoItem";
import { TodoSearch } from "./TodoSearch";
import { TodoStatus, TodoStatusFilter } from "./TodoStatusFilter";
import { TodoSuggestions } from "./TodoSuggestions";
import { UndoNotice } from "./UndoNotice";

// How far above or below the list a top-level drop still counts, in px
const TOP_LEVEL_DROP_SLACK = 48;

// Siblings only, and slots by row not group, so a drop over a group lands after it
const collideWithSiblings: CollisionDetection = ({
  active,
  droppableContainers,
  droppableRects,
  pointerCoordinates,
}) => {
  const dataOf = (data: { current?: unknown }) =>
    data.current as SortableTodoData | undefined;
  const parentKey = dataOf(active.data)?.parentKey;
  if (parentKey === undefined || !pointerCoordinates) {
    return [];
  }
  const siblings = droppableContainers
    .filter(
      (container) =>
        dataOf(container.data)?.parentKey === parentKey &&
        droppableRects.has(container.id),
    )
    .map((container) => ({
      id: container.id,
      rect: droppableRects.get(container.id)!,
      rowHeight: dataOf(container.data)?.rowRef.current?.offsetHeight,
    }))
    .sort((a, b) => a.rect.top - b.rect.top);
  if (siblings.length === 0) {
    return [];
  }

  const { x, y } = pointerCoordinates;
  // Sub-task groups border other tasks, so only the top level gets slack
  const tolerance = parentKey === "" ? TOP_LEVEL_DROP_SLACK : 0;
  const isInside =
    x >= Math.min(...siblings.map(({ rect }) => rect.left)) &&
    x <= Math.max(...siblings.map(({ rect }) => rect.right)) &&
    y >= Math.min(...siblings.map(({ rect }) => rect.top)) - tolerance &&
    y <= Math.max(...siblings.map(({ rect }) => rect.bottom)) + tolerance;
  if (!isInside) {
    return [];
  }
  const slot = siblings.filter(
    ({ id, rect, rowHeight }) =>
      id !== active.id && rect.top + (rowHeight ?? rect.height) / 2 < y,
  ).length;
  return [{ id: siblings[slot].id }];
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
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    clearCompletedTodos,
    moveTodo,
  } = store;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TodoStatus>("all");
  const rootRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  // The distance lets a tap on the handle stay a tap
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

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
  const statusLabel = { all: "", active: "active ", done: "completed " }[
    status
  ];
  const emptyMessage =
    query === ""
      ? `No ${statusLabel}todos`
      : `No ${statusLabel}todos match "${search.trim()}"`;
  // Tasks in a parent cycle never move, so they do not count as reorderable
  const hasSiblings = (nodes: TodoNode[]): boolean =>
    nodes.length > 1 || nodes.some((node) => hasSiblings(node.children));
  const canReorder = hasSiblings(buildTodoTree(groupedTodos).roots);
  const reorderHint =
    query !== "" && status !== "all"
      ? "Clear search and show all to reorder"
      : query !== ""
        ? "Clear search to reorder"
        : status !== "all" && canReorder
          ? "Show all to reorder"
          : "";
  const { roots, unreachable } = buildTodoTree(visibleTodos);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && over.id !== active.id) {
      moveTodo(String(active.id), String(over.id));
    }
  };

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
      <TodoSearch value={search} onChange={setSearch} hint={reorderHint} />
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
        <DndContext
          sensors={sensors}
          collisionDetection={collideWithSiblings}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={roots.map((node) => node.todo.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {roots.map((node) => (
                <SortableTodo
                  key={node.todo.id}
                  node={node}
                  // Positions among hidden tasks are unclear, so reordering needs the full list
                  isReorderLocked={isFiltered}
                  updateTodo={updateTodo}
                  deleteTodo={deleteTodo}
                  breakDownTodo={breakDownTodo}
                  isCopilotBusy={isBusy}
                />
              ))}
              {/* Tasks that are each other's parent belong to no group, so they cannot move */}
              {unreachable.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  parent={todos.find(
                    (parent) =>
                      parent.id === todo.parentId && parent.id !== todo.id,
                  )}
                  updateTodo={updateTodo}
                  deleteTodo={deleteTodo}
                  breakDownTodo={breakDownTodo}
                  isCopilotBusy={isBusy}
                  dragHandle={<DragHandle isLocked />}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
