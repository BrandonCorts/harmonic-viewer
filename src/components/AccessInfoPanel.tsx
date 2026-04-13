"use client";

import { useState, useEffect, useCallback } from "react";
import type { Share } from "@/hooks/useDocuments";

interface AccessInfoPanelProps {
  isOpen: boolean;
  documentId: string;
  documentName: string;
  ownerEmail: string;
  onClose: () => void;
  onOpenShareDialog: () => void;
  fetchShares: (docId: string) => Promise<Share[]>;
  isOwner: boolean;
}

export function AccessInfoPanel({
  isOpen,
  documentId,
  documentName,
  ownerEmail,
  onClose,
  onOpenShareDialog,
  fetchShares,
  isOwner,
}: AccessInfoPanelProps) {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (documentId) {
      setLoading(true);
      const data = await fetchShares(documentId);
      setShares(data);
      setLoading(false);
    }
  }, [documentId, fetchShares]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="shell-label mb-1" style={{ color: "#000", fontSize: "12px" }}>
          WHO HAS ACCESS
        </h3>
        <p className="text-xs mb-4" style={{ color: "#A6A6A6" }}>
          {documentName}
        </p>

        {loading ? (
          <div className="text-xs py-2" style={{ color: "#A6A6A6" }}>Loading...</div>
        ) : (
          <div>
            {/* Owner */}
            <div
              className="flex items-center justify-between py-2 border-b"
              style={{ borderColor: "#f0f0f0" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 flex items-center justify-center text-xs font-medium"
                  style={{ background: "#000", color: "#fff" }}
                >
                  {ownerEmail.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs" style={{ color: "#000" }}>
                  {ownerEmail}
                </span>
              </div>
              <span
                className="shell-label px-1.5 py-0.5"
                style={{ fontSize: "9px", background: "#000", color: "#fff" }}
              >
                OWNER
              </span>
            </div>

            {/* Shared users */}
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: "#f0f0f0" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 flex items-center justify-center text-xs font-medium"
                    style={{ background: "#f0f0f0", color: "#000" }}
                  >
                    {share.shared_with.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs" style={{ color: "#000" }}>
                    {share.shared_with}
                  </span>
                </div>
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
            ))}

            {shares.length === 0 && (
              <div className="text-xs py-3" style={{ color: "#A6A6A6" }}>
                Not shared with anyone yet.
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          {isOwner && (
            <button
              onClick={() => {
                onClose();
                onOpenShareDialog();
              }}
              className="shell-label px-3 py-1.5 cursor-pointer"
              style={{ background: "#005eff", color: "#fff", fontSize: "11px" }}
            >
              MANAGE ACCESS
            </button>
          )}
          <button
            onClick={onClose}
            className="shell-label px-3 py-1.5 cursor-pointer border"
            style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
