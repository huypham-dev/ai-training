"use client";

import { useEffect, useState } from "react";

interface WelcomeNoteProps {}

// A link can greet the user by name, such as ?welcome=Alex
export const WelcomeNote: React.FC<WelcomeNoteProps> = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(new URLSearchParams(window.location.search).get("welcome"));
  }, []);

  if (!name) {
    return null;
  }

  return (
    <p
      className="mb-4 text-sm text-ink-muted"
      dangerouslySetInnerHTML={{
        __html: `Welcome back, <strong>${name}</strong>!`,
      }}
    />
  );
};
