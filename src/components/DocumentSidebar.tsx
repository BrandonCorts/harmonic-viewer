"use client";

import { useState } from "react";
import type { DocumentListItem } from "@/hooks/useDocuments";
import type { SortBy, SortOrder } from "@/hooks/useDocuments";

interface DocumentSidebarProps {
  documents: DocumentListItem[];
  currentDocumentId: string | null;
  sortBy: SortBy;
  sortOrder: SortOrder;
  isLoading: boolean;
  onOpenDocument: (id: string) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string, name: string) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DocumentSidebar({
  documents,
  currentDocumentId,
  sortBy,
  sortOrder,
  isLoading,
  onOpenDocument,
  onNewDocument,
  onDeleteDocument,
  onSortByChange,
  onSortOrderChange,
  isCollapsed,
  onToggleCollapse,
}: DocumentSidebarProps) {
  const [filter, setFilter] = useState("");

  const filteredDocs = filter
    ? documents.filter((d) =>
        d.name.toLowerCase().includes(filter.toLowerCase())
      )
    : documents;

  if (isCollapsed) {
    return (
      <div
        className="sidebar-collapsed flex flex-col items-center py-3 border-r"
        style={{
          width: "40px",
          background: "#fafbfc",
          borderColor: "#e5e7eb",
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded cursor-pointer"
          style={{ color: "#6b7280" }}
          title="Expand sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3L11 8L6 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className="sidebar flex flex-col border-r shrink-0"
      style={{
        width: "280px",
        background: "#fafbfc",
        borderColor: "#e5e7eb",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: "#e5e7eb" }}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: "#374151" }}
        >
          Documents
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewDocument}
            className="text-xs font-medium px-2 py-1 rounded cursor-pointer"
            style={{ background: "#6366f1", color: "#ffffff" }}
            title="New document"
          >
            + New
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded cursor-pointer"
            style={{ color: "#6b7280" }}
            title="Collapse sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Sort + Filter */}
      <div
        className="px-3 py-2 border-b flex items-center gap-2"
        style={{ borderColor: "#e5e7eb" }}
      >
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
          className="flex-1 text-xs px-2 py-1 rounded border"
          style={{
            borderColor: "#e5e7eb",
            outline: "none",
            background: "#ffffff",
            color: "#374151",
          }}
        />
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sb, so] = e.target.value.split("-");
            onSortByChange(sb as SortBy);
            onSortOrderChange(so as SortOrder);
          }}
          className="text-xs px-1 py-1 rounded border cursor-pointer"
          style={{
            borderColor: "#e5e7eb",
            background: "#ffffff",
            color: "#374151",
            outline: "none",
          }}
        >
          <option value="updated_at-desc">Modified</option>
          <option value="created_at-desc">Created</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && documents.length === 0 ? (
          <div className="px-3 py-4 text-xs" style={{ color: "#9ca3af" }}>
            Loading...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="px-3 py-4 text-xs" style={{ color: "#9ca3af" }}>
            {filter ? "No matches" : "No documents yet"}
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="sidebar-item group flex items-center justify-between px-3 py-2 cursor-pointer"
              style={{
                background:
                  doc.id === currentDocumentId ? "#eef2ff" : "transparent",
                borderLeft:
                  doc.id === currentDocumentId
                    ? "2px solid #6366f1"
                    : "2px solid transparent",
              }}
              onClick={() => onOpenDocument(doc.id)}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-medium truncate"
                  style={{
                    color:
                      doc.id === currentDocumentId ? "#4338ca" : "#374151",
                  }}
                >
                  {doc.name}
                </div>
                <div className="text-xs" style={{ color: "#9ca3af" }}>
                  {new Date(doc.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDocument(doc.id, doc.name);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded cursor-pointer transition-opacity"
                style={{ color: "#9ca3af" }}
                title="Delete"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6.5 7v4M9.5 7v4M3.5 4l.5 9a1 1 0 001 1h6a1 1 0 001-1l.5-9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
