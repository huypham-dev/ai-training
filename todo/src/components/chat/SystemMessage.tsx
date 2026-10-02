import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SystemMessageProps {
  // Markdown text of the message. Ignored when children are provided.
  content?: string;
  children?: React.ReactNode;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({
  content,
  children,
}) => {
  return (
    <div className="flex items-start mb-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-700 bg-purple-400 text-sm">
        🪁
      </div>
      <div className="ml-2 min-w-0 max-w-[80%]">
        <span className="block text-xs text-gray-500 mb-1 ml-1">Copilot</span>
        <div className="rounded-2xl rounded-tl-sm border bg-gray-50 px-4 py-2 text-sm text-gray-900 break-words shadow-sm">
          {children ?? (
            <div className="copilotKitMarkdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content ?? ""}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
