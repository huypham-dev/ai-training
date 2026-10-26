interface TodoImportantFilterProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const TodoImportantFilter: React.FC<TodoImportantFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex w-fit rounded-xl bg-surface-sunken p-1">
      <label className="cursor-pointer">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="flex items-center gap-1 rounded-xl border border-transparent px-3 py-1 text-sm font-medium text-ink-muted transition duration-200 hover:text-ink peer-checked:border-line peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-card peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={value ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
          Important
        </span>
      </label>
    </div>
  );
};
