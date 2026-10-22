import { Todo } from "@/types/todo";

export const IMPORT_PARAM = "import";
export const IMPORT_SOURCE_PARAM = "from";

export const encodeTodos = (todos: Todo[]) => btoa(JSON.stringify(todos));

export const decodeTodos = (value: string): Todo[] =>
  JSON.parse(atob(value)) as Todo[];

export const createShareLink = (todos: Todo[], from: string) => {
  const url = new URL(window.location.origin);
  url.searchParams.set(IMPORT_PARAM, encodeTodos(todos));
  url.searchParams.set(IMPORT_SOURCE_PARAM, from);
  return url.toString();
};
