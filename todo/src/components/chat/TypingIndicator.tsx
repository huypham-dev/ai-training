interface TypingIndicatorProps {
  label?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ label }) => {
  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label={label ?? "Copilot is typing"}
    >
      <span className="flex items-center gap-1 py-1">
        <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" />
      </span>
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  );
};
