import { DraggableSyntheticListeners } from "@dnd-kit/core";

interface DragHandleProps {
  isLocked: boolean;
  handleRef?: (element: HTMLElement | null) => void;
  listeners?: DraggableSyntheticListeners;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  isLocked,
  handleRef,
  listeners,
}) => {
  return (
    <button
      type="button"
      ref={handleRef}
      {...listeners}
      disabled={isLocked}
      aria-label="Drag to reorder"
      title="Drag to reorder"
      // Without touch-none the browser scrolls the page instead of starting the drag
      className="mt-0.5 mr-2 shrink-0 cursor-grab touch-none rounded-sm text-ink-muted transition-colors duration-200 hover:text-ink active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 9h16.5m-16.5 6.75h16.5"
        />
      </svg>
    </button>
  );
};
