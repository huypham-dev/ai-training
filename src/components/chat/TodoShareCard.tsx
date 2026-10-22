import { useCopyText } from "@/hooks/useCopyText";

// Result returned by the shareTodoList copilot action
export type TodoShareResult =
  { link: string; count: number; note: string } | { error: string };

interface TodoShareCardProps {
  // Tool results reach the chat as a JSON string
  result: string;
}

const parseResult = (result: string): TodoShareResult => {
  try {
    return JSON.parse(result);
  } catch {
    return { error: result || "The share link could not be created." };
  }
};

const copyLabels = {
  idle: "Copy link",
  copied: "Link copied",
  failed: "Could not copy",
};

// Shows the share link, so the user copies it from here and not from the
// model, which can get a long link wrong when it writes it out
export const TodoShareCard: React.FC<TodoShareCardProps> = (props) => {
  const result = parseResult(props.result);
  const { status, copy } = useCopyText();

  if ("error" in result) {
    return (
      <div className="rounded-xl border border-danger bg-surface px-4 py-2 text-sm text-danger">
        {result.error}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-2 shadow-card">
      <p className="text-xs font-medium text-primary-strong">
        Share link for {result.count === 1 ? "1 task" : `${result.count} tasks`}
      </p>
      <button
        type="button"
        onClick={() => copy(result.link)}
        className="rounded-xl border bg-surface px-3 py-1 text-xs font-medium text-ink transition duration-200 hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {copyLabels[status]}
      </button>
    </div>
  );
};
