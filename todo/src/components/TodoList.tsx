"use client";

import { useTodoCopilot } from "@/hooks/useTodoCopilot";
import { useTodos } from "@/hooks/useTodos";
import { AddTodoForm } from "./AddTodoForm";
import { TodoItem } from "./TodoItem";

export const TodoList: React.FC = () => {
  const store = useTodos();
  const { todos, addTodo, updateTodo, deleteTodo } = store;

  useTodoCopilot(store);

  return (
    <div>
      <AddTodoForm addTodo={addTodo} />
      {todos.length > 0 && (
        <div className="rounded-xl border">
          {todos.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              updateTodo={updateTodo}
              deleteTodo={deleteTodo}
              hasBorder={index !== todos.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
