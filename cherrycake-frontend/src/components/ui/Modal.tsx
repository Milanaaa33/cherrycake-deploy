import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

// Generic UI component: no translation hook here (it must render without a Redux Provider).
// Callers pass the translated button text, e.g. closeLabel={t('ui.close', 'Close')}.
type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
};

export default function Modal({ open, title, children, onClose, closeLabel = "Close" }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusable()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "Tab") {
        const elements = focusable();
        if (elements.length === 0) {
          event.preventDefault();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="cc-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        padding: 16,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        ref={dialogRef}
        className="cc-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          background: "var(--color-surface)",
          color: "var(--color-text)",
          padding: 28,
          borderRadius: "var(--radius-xl)",
          border: "1.5px solid var(--cherry-border)",
          width: "min(92vw, 480px)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(35, 10, 20, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h2
            id={titleId}
            style={{
              margin: 0,
              color: "var(--color-text)",
              fontSize: "1.45rem",
              lineHeight: 1.25,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            className="modal-close-round-btn"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
            style={{ flexShrink: 0 }}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
