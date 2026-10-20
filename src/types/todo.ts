export interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
  assignedTo?: string;
  // The id of the task this one was broken down from
  parentId?: string;
  // Both dates are YYYY-MM-DD strings
  startDate?: string;
  dueDate?: string;
}

export type TodoChanges = Partial<Omit<Todo, "id">>;
