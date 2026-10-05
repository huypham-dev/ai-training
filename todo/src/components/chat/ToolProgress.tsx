interface ToolProgressProps {
  label: string;
}

// Shown in the chat while a frontend tool is still running
export const ToolProgress: React.FC<ToolProgressProps> = ({ label }) => {
  return <p className="ml-10 text-xs text-ink-muted">{label}</p>;
};
