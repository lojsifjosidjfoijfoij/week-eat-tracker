import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  title: string;
  body?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({ title, body, confirmLabel, cancelLabel, destructive = true, busy, onConfirm, onCancel }: Props) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { cancelRef.current?.focus(); }, []);

  return (
    <div className="alert-overlay" onClick={busy ? undefined : onCancel} role="presentation">
      <div className="alert-box" role="alertdialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {body && <div className="alert-body">{body}</div>}
        <div className="alert-actions">
          <button ref={cancelRef} className="btn-cancel" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button className={destructive ? "btn-destructive" : "btn-confirm"} onClick={onConfirm} disabled={busy}>
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
