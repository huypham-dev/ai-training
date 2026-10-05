export interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
  assignedTo?: string;
}

export type TodoChanges = Partial<Omit<Todo, "id">>;
