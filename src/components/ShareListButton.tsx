import { Todo } from "@/types/todo";
import { createShareLink } from "@/utils/share";
import { useState } from "react";

interface ShareListButtonProps {
  todos: Todo[];
}

export const ShareListButton: React.FC<ShareListButtonProps> = ({ todos }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(createShareLink(todos, "a friend"));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copyLink}
      className="rounded-sm text-xs font-medium text-ink-muted transition duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {isCopied ? "Link copied" : "Share list"}
    </button>
  );
};
