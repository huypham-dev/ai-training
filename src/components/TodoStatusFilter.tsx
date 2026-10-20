export type TodoStatus = "all" | "active" | "done";

const options: { value: TodoStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
];

interface TodoStatusFilterProps {
  value: TodoStatus;
  onChange: (value: TodoStatus) => void;
}

export const TodoStatusFilter: React.FC<TodoStatusFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <fieldset className="mb-6 flex w-fit gap-1 rounded-xl bg-surface-sunken p-1">
      <legend className="sr-only">Show todos</legend>
      {options.map((option) => (
        <label key={option.value} className="cursor-pointer">
          {/* Native radios give arrow-key navigation inside the group */}
          <input
            type="radio"
            name="todo-status"
            className="peer sr-only"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="block rounded-xl border border-transparent px-3 py-1 text-sm font-medium text-ink-muted transition duration-200 hover:text-ink peer-checked:border-line peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-card peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
};
