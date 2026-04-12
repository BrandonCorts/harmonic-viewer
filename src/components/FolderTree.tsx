"use client";

import type { Folder, DocumentListItem } from "@/hooks/useDocuments";

interface FolderTreeProps {
  folders: Folder[];
  documents: DocumentListItem[];
  currentDocumentId: string | null;
  expandedFolders: Set<string>;
  parentId: string | null;
  onToggleExpand: (folderId: string) => void;
  onOpenDocument: (id: string) => void;
  onDeleteDocument: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onCreateFolder: (parentId: string | null) => void;
}

export function FolderTree({
  folders,
  documents,
  currentDocumentId,
  expandedFolders,
  parentId,
  onToggleExpand,
  onOpenDocument,
  onDeleteDocument,
  onDeleteFolder,
  onCreateFolder,
}: FolderTreeProps) {
  const childFolders = folders.filter((f) => f.parent_id === parentId);
  const childDocs = documents.filter((d) => d.folder_id === parentId);

  return (
    <>
      {childFolders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.id);
        const hasChildren =
          folders.some((f) => f.parent_id === folder.id) ||
          documents.some((d) => d.folder_id === folder.id);

        return (
          <div key={folder.id}>
            <div
              className="group flex items-center justify-between px-3 py-1.5 cursor-pointer"
              style={{ paddingLeft: parentId ? "24px" : "12px" }}
              onClick={() => onToggleExpand(folder.id)}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                    opacity: hasChildren ? 1 : 0.3,
                  }}
                >
                  <path
                    d="M6 3L11 8L6 13"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 4.5C2 3.67 2.67 3 3.5 3H6.5L8 5H12.5C13.33 5 14 5.67 14 6.5V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z"
                    stroke="#000"
                    strokeWidth="1.2"
                    fill={isExpanded ? "#f0f5ff" : "none"}
                  />
                </svg>
                <span
                  className="text-xs font-medium truncate"
                  style={{ color: "#000" }}
                >
                  {folder.name}
                </span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateFolder(folder.id);
                  }}
                  className="p-0.5 cursor-pointer"
                  style={{ color: "#A6A6A6" }}
                  title="New subfolder"
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                  }}
                  className="p-0.5 cursor-pointer"
                  style={{ color: "#A6A6A6" }}
                  title="Delete folder"
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M3.5 4l.5 9a1 1 0 001 1h6a1 1 0 001-1l.5-9"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {isExpanded && (
              <div>
                <FolderTree
                  folders={folders}
                  documents={documents}
                  currentDocumentId={currentDocumentId}
                  expandedFolders={expandedFolders}
                  parentId={folder.id}
                  onToggleExpand={onToggleExpand}
                  onOpenDocument={onOpenDocument}
                  onDeleteDocument={onDeleteDocument}
                  onDeleteFolder={onDeleteFolder}
                  onCreateFolder={onCreateFolder}
                />
              </div>
            )}
          </div>
        );
      })}

      {childDocs.map((doc) => (
        <div
          key={doc.id}
          className="sidebar-item group flex items-center justify-between py-1.5 cursor-pointer"
          style={{
            paddingLeft: parentId ? "36px" : "24px",
            paddingRight: "12px",
            background: doc.id === currentDocumentId ? "#f0f5ff" : "transparent",
            borderLeft: doc.id === currentDocumentId ? "2px solid #005eff" : "2px solid transparent",
          }}
          onClick={() => onOpenDocument(doc.id)}
        >
          <div className="flex-1 min-w-0">
            <div
              className="text-xs truncate"
              style={{ color: doc.id === currentDocumentId ? "#005eff" : "#000" }}
            >
              {doc.name}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDocument(doc.id, doc.name);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 cursor-pointer transition-opacity"
            style={{ color: "#A6A6A6" }}
            title="Delete"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M3.5 4l.5 9a1 1 0 001 1h6a1 1 0 001-1l.5-9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </>
  );
}
