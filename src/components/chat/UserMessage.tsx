import { CopilotChatUserMessageProps } from "@copilotkit/react-core/v2";

// Rendered through the `userMessage` slot of the message view
export const UserMessage: React.FC<CopilotChatUserMessageProps> = ({
  message,
}) => {
  // The content is either plain text or a list of parts (text, images, ...)
  const content =
    typeof message.content === "string"
      ? message.content
      : (message.content ?? [])
          .map((part) => (part.type === "text" ? part.text : ""))
          .filter(Boolean)
          .join("\n");

  return (
    <div className="flex flex-col items-end mb-4" data-message-id={message.id}>
      <span className="text-xs font-medium text-ink-muted mb-1 mr-1">You</span>
      <div className="max-w-[80%] rounded-xl rounded-tr-sm bg-primary-strong px-4 py-2 text-sm text-white whitespace-pre-wrap break-words shadow-card">
        {content}
      </div>
    </div>
  );
};
