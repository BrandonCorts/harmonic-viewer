"use client";

import { useState, useEffect, useCallback } from "react";
import type { Share } from "@/hooks/useDocuments";

interface ShareDialogProps {
  isOpen: boolean;
  documentId: string;
  documentName: string;
  onClose: () => void;
  onShare: (docId: string, email: string, permission: string) => Promise<unknown>;
  onUnshare: (docId: string, shareId: string) => Promise<void>;
  fetchShares: (docId: string) => Promise<Share[]>;
  error?: string | null;
  clearError: () => void;
}

export function ShareDialog({
  isOpen,
  documentId,
  documentName,
  onClose,
  onShare,
  onUnshare,
  fetchShares,
  error,
  clearError,
}: ShareDialogProps) {
  const [shares, setShares] = useState<Share[]>([]);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [loading, setLoading] = useState(false);

  const loadShares = useCallback(async () => {
    if (documentId) {
      const data = await fetchShares(documentId);
      setShares(data);
    }
  }, [documentId, fetchShares]);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPermission("view");
      clearError();
      loadShares();
    }
  }, [isOpen, loadShares, clearError]);

  const handleShare = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const result = await onShare(documentId, email.trim(), permission);
    if (result) {
      setEmail("");
      await loadShares();
    }
    setLoading(false);
  };

  const handleUnshare = async (shareId: string) => {
    await onUnshare(documentId, shareId);
    await loadShares();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-panel"
        style={{ maxWidth: "440px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="shell-label mb-1" style={{ color: "#000", fontSize: "12px" }}>
          SHARE DOCUMENT
        </h3>
        <p className="text-xs mb-4" style={{ color: "#A6A6A6" }}>
          {documentName}
        </p>

        {/* Add share form */}
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleShare();
              if (e.key === "Escape") onClose();
            }}
            placeholder="user@newlab.com"
            className="flex-1 px-3 py-2 text-xs border"
            style={{ borderColor: "#000", outline: "none", color: "#000" }}
          />
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value as "view" | "edit")}
            className="text-xs px-2 py-2 border cursor-pointer"
            style={{ borderColor: "#000", background: "#fff", color: "#000", outline: "none" }}
          >
            <option value="view">View</option>
            <option value="edit">Edit</option>
          </select>
          <button
            onClick={handleShare}
            disabled={loading || !email.trim()}
            className="shell-label px-3 py-1.5 cursor-pointer"
            style={{
              background: email.trim() ? "#005eff" : "#99c2ff",
              color: "#fff",
              fontSize: "11px",
            }}
          >
            SHARE
          </button>
        </div>

        {error && (
          <p className="text-xs mb-3" style={{ color: "#dc2626" }}>{error}</p>
        )}

        {/* Current shares */}
        {shares.length > 0 && (
          <div>
            <div className="shell-label mb-2" style={{ color: "#A6A6A6", fontSize: "10px" }}>
              SHARED WITH
            </div>
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between py-1.5 border-t"
                style={{ borderColor: "#e0e0e0" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "#000" }}>
                    {share.shared_with}
                  </span>
                  <span
                    className="shell-label px-1.5 py-0.5"
                    style={{
                      fontSize: "9px",
                      background: share.permission === "edit" ? "#005eff" : "#f0f0f0",
                      color: share.permission === "edit" ? "#fff" : "#000",
                    }}
                  >
                    {share.permission.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => handleUnshare(share.id)}
                  className="text-xs cursor-pointer"
                  style={{ color: "#dc2626" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="shell-label px-3 py-1.5 cursor-pointer border"
            style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
