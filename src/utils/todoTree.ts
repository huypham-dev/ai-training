import { Todo } from "@/types/todo";

// Sub-tasks hang under the task they were broken down from, through `parentId`
export const childrenByParent = (todos: Todo[]): Map<string, Todo[]> => {
  const children = new Map<string, Todo[]>();
  for (const todo of todos) {
    if (todo.parentId === undefined) {
      continue;
    }
    const siblings = children.get(todo.parentId);
    if (siblings) {
      siblings.push(todo);
    } else {
      children.set(todo.parentId, [todo]);
    }
  }
  return children;
};

// The ids of the given tasks with all their sub-tasks, at any depth
export const withDescendants = (
  todos: Todo[],
  rootIds: string[],
): Set<string> => {
  const children = childrenByParent(todos);
  const ids = new Set<string>();
  const queue = [...rootIds];
  for (let i = 0; i < queue.length; i++) {
    // Tasks that are each other's parent would loop forever
    if (ids.has(queue[i])) {
      continue;
    }
    ids.add(queue[i]);
    queue.push(...(children.get(queue[i]) ?? []).map((todo) => todo.id));
  }
  return ids;
};
