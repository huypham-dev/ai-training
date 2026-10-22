import { parseTodos } from "@/hooks/useTodos";
import { Todo } from "@/types/todo";
import { nanoid } from "nanoid";

export const IMPORT_PARAM = "import";
export const IMPORT_SOURCE_PARAM = "from";

// Servers reject longer request lines (Node allows 16 KB of headers) and chat
// apps cut long links, so a bigger list is not shared
const MAX_LINK_LENGTH = 8000;

// btoa only takes Latin-1, so the text is sent as UTF-8 bytes
const encodeTodos = (todos: Todo[]) => {
  const bytes = new TextEncoder().encode(JSON.stringify(todos));
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
};

// The link can be cut or edited, so anything that is not a valid list is
// dropped. Items get new ids, so an import never replaces a task already there
export const decodeTodos = (value: string): Todo[] | undefined => {
  let todos: Todo[] | undefined;
  try {
    const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
    todos = parseTodos(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return undefined;
  }
  if (!todos) {
    return undefined;
  }

  const newIds = new Map(todos.map((todo) => [todo.id, nanoid()]));
  return todos.map((todo) => ({
    ...todo,
    id: newIds.get(todo.id) ?? nanoid(),
    parentId: todo.parentId ? newIds.get(todo.parentId) : undefined,
  }));
};

// Returns undefined when the list is too long for a link
export const createShareLink = (todos: Todo[], from: string) => {
  const url = new URL(window.location.origin);
  url.searchParams.set(IMPORT_PARAM, encodeTodos(todos));
  url.searchParams.set(IMPORT_SOURCE_PARAM, from);
  const link = url.toString();
  return link.length <= MAX_LINK_LENGTH ? link : undefined;
};
