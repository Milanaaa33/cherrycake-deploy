// Generic UI component: no translation hook here (it must render without a Redux Provider).
// Callers pass the translated label, e.g. closeLabel={t('ui.closeNotification', 'Close notification')}.
type ToastProps = {
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "warning";
  closeLabel?: string;
};

export default function Toast({
  message,
  onClose,
  type = "error",
  closeLabel = "Close notification",
}: ToastProps) {
  const colors = {
    success: "var(--color-success)",
    error: "var(--color-primary)",
    warning: "var(--color-warning)",
  };

  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: colors[type],
        color: "white",
        padding: "16px 20px",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 12px 36px rgba(80, 30, 45, 0.22)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        gap: 12,
        maxWidth: "min(420px, calc(100vw - 32px))",
      }}
    >
      <span>{message}</span>
      <button onClick={onClose} aria-label={closeLabel}>
        ×
      </button>
    </div>
  );
}
