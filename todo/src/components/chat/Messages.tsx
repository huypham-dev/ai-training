import { useCopilotContext } from "@copilotkit/react-core";
import { MessagesProps, useChatContext } from "@copilotkit/react-ui";
import {
  ActionExecutionMessage,
  MessageStatusCode,
  ResultMessage,
  TextMessage,
} from "@copilotkit/runtime-client-gql";
import { useEffect, useRef } from "react";
import { SystemMessage } from "./SystemMessage";
import { TypingIndicator } from "./TypingIndicator";
import { UserMessage } from "./UserMessage";

export const Messages: React.FC<MessagesProps> = ({
  messages,
  inProgress,
  children,
}) => {
  const { chatComponentsCache } = useCopilotContext();
  const { labels } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessages = ([] as string[]).concat(labels.initial);

  const actionResults: Record<string, string> = {};
  for (const message of messages) {
    if (message instanceof ResultMessage) {
      actionResults[message.actionExecutionId] = ResultMessage.decodeResult(
        message.result || "",
      );
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, inProgress]);

  const lastMessage = messages[messages.length - 1];
  // The request has been sent but the copilot has not started answering yet
  const isWaitingForResponse =
    inProgress && lastMessage instanceof TextMessage && lastMessage.role === "user";

  return (
    <div className="copilotKitMessages">
      {initialMessages.map((content, index) => (
        <SystemMessage key={`initial-${index}`} content={content} />
      ))}

      {messages.map((message, index) => {
        const isCurrentMessage = index === messages.length - 1;

        if (message instanceof TextMessage && message.role === "user") {
          return <UserMessage key={message.id} content={message.content} />;
        }

        if (message instanceof TextMessage && message.role === "assistant") {
          if (!message.content) {
            return isCurrentMessage && inProgress ? (
              <SystemMessage key={message.id}>
                <TypingIndicator />
              </SystemMessage>
            ) : null;
          }
          return <SystemMessage key={message.id} content={message.content} />;
        }

        if (message instanceof ActionExecutionMessage) {
          const render = chatComponentsCache.current?.[message.name];

          // No render or a static label: only shown while the action is running
          if (render === undefined || typeof render === "string") {
            return isCurrentMessage && inProgress ? (
              <SystemMessage key={message.id}>
                <TypingIndicator label={render} />
              </SystemMessage>
            ) : null;
          }

          const result = actionResults[message.id];
          const status =
            result !== undefined
              ? "complete"
              : message.status.code !== MessageStatusCode.Pending
                ? "executing"
                : "inProgress";

          const rendered = render({
            status: status as any,
            args: message.arguments,
            result,
          });

          if (!rendered && status === "complete") {
            return null;
          }

          return typeof rendered === "string" ? (
            <SystemMessage key={message.id}>
              {isCurrentMessage && inProgress ? (
                <TypingIndicator label={rendered} />
              ) : (
                rendered
              )}
            </SystemMessage>
          ) : (
            <div key={message.id} className="copilotKitCustomAssistantMessage">
              {rendered}
            </div>
          );
        }

        return null;
      })}

      {isWaitingForResponse && (
        <SystemMessage>
          <TypingIndicator />
        </SystemMessage>
      )}

      <footer ref={messagesEndRef}>{children}</footer>
    </div>
  );
};
