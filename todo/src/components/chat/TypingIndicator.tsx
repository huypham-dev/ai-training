// Rendered through the `cursor` slot of the message view while the agent is running
export const TypingIndicator = () => {
  return (
    <div
      className="ml-10 flex items-center gap-1 py-1"
      role="status"
      aria-label="Copilot is typing"
    >
      <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
    </div>
  );
};
