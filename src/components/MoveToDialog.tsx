"use client";

import { useState } from "react";
import type { Folder } from "@/hooks/useDocuments";

interface MoveToDialogProps {
  isOpen: boolean;
  documentName: string;
  folders: Folder[];
  currentFolderId: string | null;
  onMove: (folderId: string | null) => void;
  onCancel: () => void;
}

function FolderPickerItem({
  folder,
  folders,
  selectedId,
  currentFolderId,
  depth,
  onSelect,
}: {
  folder: Folder;
  folders: Folder[];
  selectedId: string | null;
  currentFolderId: string | null;
  depth: number;
  onSelect: (id: string | null) => void;
}) {
  const children = folders.filter((f) => f.parent_id === folder.id);
  const isCurrent = folder.id === currentFolderId;
  const isSelected = folder.id === selectedId;

  return (
    <>
      <div
        className="flex items-center gap-2 py-1.5 px-2 cursor-pointer"
        style={{
          paddingLeft: `${12 + depth * 16}px`,
          background: isSelected ? "#f0f5ff" : "transparent",
          opacity: isCurrent ? 0.4 : 1,
        }}
        onClick={() => !isCurrent && onSelect(folder.id)}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 4.5C2 3.67 2.67 3 3.5 3H6.5L8 5H12.5C13.33 5 14 5.67 14 6.5V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z"
            stroke={isSelected ? "#005eff" : "#000"}
            strokeWidth="1.2"
            fill={isSelected ? "#f0f5ff" : "none"}
          />
        </svg>
        <span
          className="text-xs"
          style={{ color: isSelected ? "#005eff" : isCurrent ? "#A6A6A6" : "#000" }}
        >
          {folder.name}
          {isCurrent && " (current)"}
        </span>
      </div>
      {children.map((child) => (
        <FolderPickerItem
          key={child.id}
          folder={child}
          folders={folders}
          selectedId={selectedId}
          currentFolderId={currentFolderId}
          depth={depth + 1}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

export function MoveToDialog({
  isOpen,
  documentName,
  folders,
  currentFolderId,
  onMove,
  onCancel,
}: MoveToDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const rootFolders = folders.filter((f) => f.parent_id === null);
  const isRootSelected = selectedFolderId === "root";
  const isCurrentlyRoot = currentFolderId === null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="shell-label mb-1" style={{ color: "#000", fontSize: "12px" }}>
          MOVE DOCUMENT
        </h3>
        <p className="text-xs mb-4" style={{ color: "#A6A6A6" }}>
          {documentName}
        </p>

        <div
          className="border mb-4 overflow-y-auto"
          style={{ borderColor: "#000", maxHeight: "300px" }}
        >
          {/* Root option */}
          <div
            className="flex items-center gap-2 py-1.5 px-3 cursor-pointer"
            style={{
              background: isRootSelected ? "#f0f5ff" : "transparent",
              opacity: isCurrentlyRoot ? 0.4 : 1,
            }}
            onClick={() => !isCurrentlyRoot && setSelectedFolderId("root")}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3h10v10H3V3z"
                stroke={isRootSelected ? "#005eff" : "#000"}
                strokeWidth="1.2"
              />
            </svg>
            <span
              className="text-xs font-medium"
              style={{ color: isRootSelected ? "#005eff" : isCurrentlyRoot ? "#A6A6A6" : "#000" }}
            >
              Root (no folder)
              {isCurrentlyRoot && " (current)"}
            </span>
          </div>

          {rootFolders.map((folder) => (
            <FolderPickerItem
              key={folder.id}
              folder={folder}
              folders={folders}
              selectedId={selectedFolderId}
              currentFolderId={currentFolderId}
              depth={0}
              onSelect={setSelectedFolderId}
            />
          ))}

          {folders.length === 0 && (
            <div className="px-3 py-4 text-xs" style={{ color: "#A6A6A6" }}>
              No folders yet. Create a folder first.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="shell-label px-3 py-1.5 cursor-pointer border"
            style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
          >
            CANCEL
          </button>
          <button
            onClick={() => {
              if (selectedFolderId === "root") onMove(null);
              else if (selectedFolderId) onMove(selectedFolderId);
            }}
            disabled={!selectedFolderId}
            className="shell-label px-3 py-1.5 cursor-pointer"
            style={{
              background: selectedFolderId ? "#005eff" : "#99c2ff",
              color: "#fff",
              fontSize: "11px",
            }}
          >
            MOVE
          </button>
        </div>
      </div>
    </div>
  );
}
