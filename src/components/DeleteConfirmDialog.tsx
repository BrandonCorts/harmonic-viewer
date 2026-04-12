"use client";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  documentName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  documentName,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="shell-label mb-2" style={{ color: "#000", fontSize: "12px" }}>
          DELETE DOCUMENT
        </h3>
        <p className="text-xs mb-4" style={{ color: "#A6A6A6" }}>
          Are you sure you want to delete &ldquo;{documentName}&rdquo;? This
          cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="shell-label px-3 py-1.5 cursor-pointer border"
            style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="shell-label px-3 py-1.5 cursor-pointer"
            style={{ background: "#dc2626", color: "#fff", fontSize: "11px" }}
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
