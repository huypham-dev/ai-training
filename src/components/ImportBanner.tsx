interface ImportBannerProps {
  count: number;
  from: string;
  onDismiss: () => void;
}

export const ImportBanner: React.FC<ImportBannerProps> = ({
  count,
  from,
  onDismiss,
}) => {
  return (
    <div
      role="status"
      className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-surface-sunken px-4 py-3 text-sm text-ink"
    >
      <p
        dangerouslySetInnerHTML={{
          __html: `Imported ${count} task(s) from <strong>${from}</strong>.`,
        }}
      />
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-sm text-xs font-medium text-ink-muted transition duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Dismiss
      </button>
    </div>
  );
};
