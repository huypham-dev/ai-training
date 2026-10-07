export interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
  assignedTo?: string;
  // The id of the task this one was broken down from
  parentId?: string;
}

export type TodoChanges = Partial<Omit<Todo, "id">>;
