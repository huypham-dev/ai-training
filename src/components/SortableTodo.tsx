import { Todo, TodoChanges } from "@/types/todo";
import { TodoNode } from "@/utils/todoOrder";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef } from "react";
import { DragHandle } from "./DragHandle";
import { TodoItem } from "./TodoItem";

// Read by the collision detection in TodoList to keep a drag among siblings
export interface SortableTodoData {
  parentKey: string;
  rowRef: React.RefObject<HTMLDivElement>;
}

interface SortableTodoProps {
  node: TodoNode;
  parent?: Todo;
  isReorderLocked: boolean;
  updateTodo: (id: string, changes: TodoChanges) => void;
  deleteTodo: (id: string) => void;
  breakDownTodo: (todo: Todo) => void;
  isCopilotBusy: boolean;
}

export const SortableTodo: React.FC<SortableTodoProps> = ({
  node,
  parent,
  isReorderLocked,
  ...itemProps
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const data: SortableTodoData = { parentKey: parent?.id ?? "", rowRef };
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.todo.id, disabled: isReorderLocked, data });

  return (
    // The wrapper holds the sub-tasks too, so they move with their parent
    <div
      ref={setNodeRef}
      // The drag offset changes every frame, so it cannot be a class
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`flex flex-col gap-3${isDragging ? " relative z-10" : ""}`}
    >
      <div ref={rowRef}>
        <TodoItem
          todo={node.todo}
          parent={parent}
          dragHandle={
            <DragHandle
              isLocked={isReorderLocked}
              handleRef={setActivatorNodeRef}
              listeners={listeners}
            />
          }
          {...itemProps}
        />
      </div>
      {node.children.length > 0 && (
        <SortableContext
          items={node.children.map((child) => child.todo.id)}
          strategy={verticalListSortingStrategy}
        >
          {node.children.map((child) => (
            <SortableTodo
              key={child.todo.id}
              node={child}
              parent={node.todo}
              isReorderLocked={isReorderLocked}
              {...itemProps}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
};
