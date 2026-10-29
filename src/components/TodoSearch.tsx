interface TodoSearchProps {
  value: string;
  onChange: (value: string) => void;
  // A caption under the bar, such as why the list cannot be reordered
  hint?: string;
}

export const TodoSearch: React.FC<TodoSearchProps> = ({
  value,
  onChange,
  hint,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 rounded-xl bg-surface-sunken px-4 py-3 text-ink-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 shrink-0"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="search"
          className="min-w-0 flex-1 bg-transparent text-base leading-[1.6] text-ink outline-none placeholder:text-ink-muted"
          value={value}
          placeholder="Search todos"
          aria-label="Search todos"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {/* Kept mounted so screen readers announce the text when it appears */}
      <p
        className="mt-2 text-xs text-ink-muted empty:hidden"
        aria-live="polite"
      >
        {hint}
      </p>
    </div>
  );
};
