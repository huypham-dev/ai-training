import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copied" | "failed";

// Copies text and shows the outcome for two seconds
export const useCopyText = () => {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = useCallback(async (text: string | undefined) => {
    let nextStatus: CopyStatus = "failed";
    if (text !== undefined) {
      try {
        await navigator.clipboard.writeText(text);
        nextStatus = "copied";
      } catch {
        // The clipboard can be blocked, which the label then shows
      }
    }
    setStatus(nextStatus);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus("idle"), 2000);
  }, []);

  return { status, copy };
};
