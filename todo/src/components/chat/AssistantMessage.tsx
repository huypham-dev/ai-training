import {
  CopilotChatAssistantMessageProps,
  CopilotChatToolCallsView,
} from "@copilotkit/react-core/v2";
import { SystemMessage } from "./SystemMessage";

// Rendered through the `assistantMessage` slot of the message view
export const AssistantMessage: React.FC<CopilotChatAssistantMessageProps> = ({
  message,
  messages,
}) => {
  const content = message.content?.trim();

  return (
    <div data-message-id={message.id}>
      {content && <SystemMessage content={content} />}
      {/* Whatever the tools render for the tool calls of this message */}
      <div className="mb-4 empty:hidden">
        <CopilotChatToolCallsView message={message} messages={messages} />
      </div>
    </div>
  );
};
