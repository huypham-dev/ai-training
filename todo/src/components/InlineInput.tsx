import { useRef, useState } from "react";

interface InlineInputProps {
  initialValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
}

export const InlineInput: React.FC<InlineInputProps> = ({
  initialValue,
  onSubmit,
  onCancel,
  ariaLabel,
  placeholder,
  className,
}) => {
  const [value, setValue] = useState(initialValue);
  // Enter and Escape unmount the input, which can also fire blur
  const isDone = useRef(false);

  const finish = (callback: () => void) => {
    if (isDone.current) return;
    isDone.current = true;
    callback();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      finish(() => onSubmit(value));
    } else if (e.key === "Escape") {
      // Keep Escape from also closing the copilot popup
      e.stopPropagation();
      finish(onCancel);
    }
  };

  return (
    <input
      className={
        "border rounded-xl px-2 py-1 text-sm text-ink focus:outline-2 focus:outline-offset-2 focus:outline-primary " +
        (className ?? "")
      }
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      autoFocus
      onFocus={(e) => e.target.select()}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => finish(() => onSubmit(value))}
    />
  );
};
