import { Todo } from "@/types/todo";

export interface TodoNode {
  todo: Todo;
  children: TodoNode[];
}

// The task a todo hangs under on screen; a missing parent makes it top-level
export const parentKeyOf = (todo: Todo, ids: Set<string>): string =>
  todo.parentId && ids.has(todo.parentId) ? todo.parentId : "";

// Puts every sub-task right below the task it was broken down from
export const groupByParent = (todos: Todo[]): Todo[] => {
  const ids = new Set(todos.map((todo) => todo.id));
  const visited = new Set<string>();

  const withSubTasks = (todo: Todo): Todo[] => {
    if (visited.has(todo.id)) {
      return [];
    }
    visited.add(todo.id);
    return [
      todo,
      ...todos
        .filter((child) => child.parentId === todo.id)
        .flatMap(withSubTasks),
    ];
  };

  const grouped = todos
    .filter((todo) => !todo.parentId || !ids.has(todo.parentId))
    .flatMap(withSubTasks);
  // Tasks that are each other's parent have no top-level task to hang under
  return [...grouped, ...todos.filter((todo) => !visited.has(todo.id))];
};

// Nests a grouped list; tasks in a parent cycle cannot be nested and come back in `unreachable`
export const buildTodoTree = (
  todos: Todo[],
): { roots: TodoNode[]; unreachable: Todo[] } => {
  const ids = new Set(todos.map((todo) => todo.id));
  const visited = new Set<string>();

  const toNode = (todo: Todo): TodoNode => {
    visited.add(todo.id);
    return {
      todo,
      children: todos
        .filter((child) => child.parentId === todo.id && !visited.has(child.id))
        .map(toNode),
    };
  };

  const roots = todos
    .filter((todo) => parentKeyOf(todo, ids) === "")
    .map(toNode);
  return { roots, unreachable: todos.filter((todo) => !visited.has(todo.id)) };
};

// Returns display order, so the saved list reads the way it is shown
export const moveTodoBlock = (
  todos: Todo[],
  activeId: string,
  overId: string,
): Todo[] => {
  const ids = new Set(todos.map((todo) => todo.id));
  const active = todos.find((todo) => todo.id === activeId);
  const over = todos.find((todo) => todo.id === overId);
  if (
    !active ||
    !over ||
    active === over ||
    parentKeyOf(active, ids) !== parentKeyOf(over, ids)
  ) {
    return todos;
  }

  const grouped = groupByParent(todos);
  const { roots } = buildTodoTree(grouped);
  const sizeById = new Map<string, number>();
  const measure = (node: TodoNode): number => {
    const size =
      1 + node.children.reduce((sum, child) => sum + measure(child), 0);
    sizeById.set(node.todo.id, size);
    return size;
  };
  roots.forEach(measure);
  const activeSize = sizeById.get(activeId);
  const overSize = sizeById.get(overId);
  // Tasks in a parent cycle are not part of any group and cannot move
  if (activeSize === undefined || overSize === undefined) {
    return todos;
  }

  const activeIndex = grouped.findIndex((todo) => todo.id === activeId);
  const overIndex = grouped.findIndex((todo) => todo.id === overId);
  const block = grouped.slice(activeIndex, activeIndex + activeSize);
  const rest = [
    ...grouped.slice(0, activeIndex),
    ...grouped.slice(activeIndex + activeSize),
  ];
  const overIndexInRest = rest.findIndex((todo) => todo.id === overId);
  const insertAt =
    activeIndex < overIndex ? overIndexInRest + overSize : overIndexInRest;
  return [...rest.slice(0, insertAt), ...block, ...rest.slice(insertAt)];
};
