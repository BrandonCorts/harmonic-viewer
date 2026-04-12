"use client";

import { useState, useEffect, useRef } from "react";

interface CreateFolderDialogProps {
  isOpen: boolean;
  parentFolderName: string | null;
  onSave: (name: string) => void;
  onCancel: () => void;
  error?: string | null;
}

export function CreateFolderDialog({
  isOpen,
  parentFolderName,
  onSave,
  onCancel,
  error,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="shell-label mb-1" style={{ color: "#000", fontSize: "12px" }}>
          NEW FOLDER
        </h3>
        {parentFolderName && (
          <p className="text-xs mb-3" style={{ color: "#A6A6A6" }}>
            Inside: {parentFolderName}
          </p>
        )}

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onSave(name.trim());
            if (e.key === "Escape") onCancel();
          }}
          placeholder="Folder name"
          className="w-full px-3 py-2 text-sm border mb-2"
          style={{
            borderColor: error ? "#dc2626" : "#000",
            outline: "none",
            color: "#000",
          }}
          autoFocus
        />

        {error && (
          <p className="text-xs mb-3" style={{ color: "#dc2626" }}>{error}</p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="shell-label px-3 py-1.5 cursor-pointer border"
            style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
          >
            CANCEL
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="shell-label px-3 py-1.5 cursor-pointer"
            style={{
              background: name.trim() ? "#005eff" : "#99c2ff",
              color: "#fff",
              fontSize: "11px",
            }}
          >
            CREATE
          </button>
        </div>
      </div>
    </div>
  );
}
