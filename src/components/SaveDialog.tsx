"use client";

import { useState, useEffect, useRef } from "react";

interface SaveDialogProps {
  isOpen: boolean;
  initialName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
  error?: string | null;
}

export function SaveDialog({
  isOpen,
  initialName,
  onSave,
  onCancel,
  error,
}: SaveDialogProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        className="dialog-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "#111827" }}
        >
          Save Document
        </h3>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onSave(name.trim());
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Document name"
          className="w-full px-3 py-2 text-sm rounded-md border mb-2"
          style={{
            borderColor: error ? "#fecaca" : "#e5e7eb",
            outline: "none",
            color: "#111827",
          }}
          autoFocus
        />

        {error && (
          <p className="text-xs mb-3" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
            style={{ background: "#f3f4f6", color: "#374151" }}
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer"
            style={{
              background: name.trim() ? "#6366f1" : "#c7d2fe",
              color: "#ffffff",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
