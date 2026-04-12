"use client";

import { useState } from "react";
import type { DocumentListItem, Folder, SharedDocument } from "@/hooks/useDocuments";
import type { SortBy, SortOrder } from "@/hooks/useDocuments";
import { FolderTree } from "@/components/FolderTree";

interface DocumentSidebarProps {
  documents: DocumentListItem[];
  folders: Folder[];
  sharedDocuments: SharedDocument[];
  currentDocumentId: string | null;
  expandedFolders: Set<string>;
  sortBy: SortBy;
  sortOrder: SortOrder;
  isLoading: boolean;
  onOpenDocument: (id: string) => void;
  onOpenSharedDocument: (doc: SharedDocument) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onCreateFolder: (parentId: string | null) => void;
  onToggleFolderExpand: (folderId: string) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DocumentSidebar({
  documents,
  folders,
  sharedDocuments,
  currentDocumentId,
  expandedFolders,
  sortBy,
  sortOrder,
  isLoading,
  onOpenDocument,
  onOpenSharedDocument,
  onNewDocument,
  onDeleteDocument,
  onDeleteFolder,
  onCreateFolder,
  onToggleFolderExpand,
  onSortByChange,
  onSortOrderChange,
  isCollapsed,
  onToggleCollapse,
}: DocumentSidebarProps) {
  const [filter, setFilter] = useState("");

  const filteredDocs = filter
    ? documents.filter((d) => d.name.toLowerCase().includes(filter.toLowerCase()))
    : documents;

  const filteredFolders = filter
    ? folders.filter((f) => f.name.toLowerCase().includes(filter.toLowerCase()))
    : folders;

  const filteredShared = filter
    ? sharedDocuments.filter((d) => d.name.toLowerCase().includes(filter.toLowerCase()))
    : sharedDocuments;

  if (isCollapsed) {
    return (
      <div
        className="sidebar-collapsed flex flex-col items-center py-3 border-r"
        style={{ width: "40px", background: "#fff", borderColor: "#000" }}
      >
        <button
          onClick={onToggleCollapse}
          className="p-1.5 cursor-pointer"
          style={{ color: "#000" }}
          title="Expand sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className="sidebar flex flex-col border-r shrink-0"
      style={{ width: "280px", background: "#fff", borderColor: "#000" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "#000" }}>
        <span className="shell-label" style={{ color: "#000" }}>DOCUMENTS</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCreateFolder(null)}
            className="shell-label px-2 py-1 cursor-pointer border"
            style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "10px" }}
            title="New folder"
          >
            + FOLDER
          </button>
          <button
            onClick={onNewDocument}
            className="shell-label px-2 py-1 cursor-pointer"
            style={{ background: "#005eff", color: "#fff", fontSize: "10px" }}
            title="New document"
          >
            + NEW
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 cursor-pointer"
            style={{ color: "#000" }}
            title="Collapse sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sort + Filter */}
      <div className="px-3 py-2 border-b flex items-center gap-2" style={{ borderColor: "#000" }}>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter..."
          className="flex-1 text-xs px-2 py-1 border"
          style={{ borderColor: "#000", outline: "none", background: "#fff", color: "#000" }}
        />
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sb, so] = e.target.value.split("-");
            onSortByChange(sb as SortBy);
            onSortOrderChange(so as SortOrder);
          }}
          className="text-xs px-1 py-1 border cursor-pointer"
          style={{ borderColor: "#000", background: "#fff", color: "#000", outline: "none" }}
        >
          <option value="updated_at-desc">Modified</option>
          <option value="created_at-desc">Created</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>

      {/* Document & folder list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && documents.length === 0 ? (
          <div className="px-3 py-4 text-xs" style={{ color: "#A6A6A6" }}>Loading...</div>
        ) : filteredDocs.length === 0 && filteredFolders.length === 0 && !filter ? (
          <div className="px-3 py-4 text-xs" style={{ color: "#A6A6A6" }}>No documents yet</div>
        ) : (
          <FolderTree
            folders={filteredFolders}
            documents={filteredDocs}
            currentDocumentId={currentDocumentId}
            expandedFolders={expandedFolders}
            parentId={null}
            onToggleExpand={onToggleFolderExpand}
            onOpenDocument={onOpenDocument}
            onDeleteDocument={onDeleteDocument}
            onDeleteFolder={onDeleteFolder}
            onCreateFolder={onCreateFolder}
          />
        )}

        {/* Shared with me */}
        {filteredShared.length > 0 && (
          <>
            <div
              className="px-3 py-2 mt-2 border-t"
              style={{ borderColor: "#000" }}
            >
              <span className="shell-label" style={{ color: "#A6A6A6", fontSize: "10px" }}>
                SHARED WITH ME
              </span>
            </div>
            {filteredShared.map((doc) => (
              <div
                key={`shared-${doc.id}`}
                className="sidebar-item group flex items-center justify-between px-3 py-1.5 cursor-pointer"
                style={{
                  background: doc.id === currentDocumentId ? "#f0f5ff" : "transparent",
                  borderLeft: doc.id === currentDocumentId ? "2px solid #005eff" : "2px solid transparent",
                }}
                onClick={() => onOpenSharedDocument(doc)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M4 12V8h8v4M8 8V4M5 4h6" stroke="#A6A6A6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span
                      className="text-xs truncate"
                      style={{ color: doc.id === currentDocumentId ? "#005eff" : "#000" }}
                    >
                      {doc.name}
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-1" style={{ color: "#A6A6A6", paddingLeft: "16px" }}>
                    {doc.owner_email.split("@")[0]}
                    <span
                      className="shell-label px-1"
                      style={{
                        fontSize: "8px",
                        background: doc.permission === "edit" ? "#005eff" : "#f0f0f0",
                        color: doc.permission === "edit" ? "#fff" : "#000",
                      }}
                    >
                      {doc.permission.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
