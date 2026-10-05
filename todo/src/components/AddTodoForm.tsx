import { useState } from "react";

interface AddTodoFormProps {
  addTodo: (text: string) => void;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ addTodo }) => {
  const [input, setInput] = useState("");

  const submit = () => {
    // Keep the input as it is when there is nothing to add
    if (input.trim() === "") {
      return;
    }
    addTodo(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submit();
    }
  };

  return (
    <>
      <label htmlFor="new-todo" className="mb-2 block text-sm font-medium">
        New task
      </label>
      <div className="flex mb-6">
        <input
          id="new-todo"
          className="flex-1 mr-2 rounded-xl border bg-surface p-3 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="rounded-xl bg-primary-strong px-4 py-3 font-semibold text-white transition duration-200 hover:bg-primary-strong-hover hover:shadow-card active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={submit}
        >
          Add Todo
        </button>
      </div>
    </>
  );
};
