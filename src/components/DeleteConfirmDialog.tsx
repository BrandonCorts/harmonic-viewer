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
      <div
        className="dialog-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-sm font-semibold mb-2"
          style={{ color: "#111827" }}
        >
          Delete Document
        </h3>
        <p className="text-xs mb-4" style={{ color: "#6b7280" }}>
          Are you sure you want to delete &ldquo;{documentName}&rdquo;? This
          cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
            style={{ background: "#f3f4f6", color: "#374151" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
            style={{ background: "#dc2626", color: "#ffffff" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
