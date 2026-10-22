import { useCopyText } from "@/hooks/useCopyText";
import { Todo } from "@/types/todo";
import { createShareLink } from "@/utils/share";

interface ShareListButtonProps {
  todos: Todo[];
}

const labels = {
  idle: "Share list",
  copied: "Link copied",
  failed: "Could not share",
};

export const ShareListButton: React.FC<ShareListButtonProps> = ({ todos }) => {
  const { status, copy } = useCopyText();

  return (
    <button
      type="button"
      onClick={() => copy(createShareLink(todos, "a friend"))}
      className="rounded-sm text-xs font-medium text-ink-muted transition duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {labels[status]}
    </button>
  );
};
