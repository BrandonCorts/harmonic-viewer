"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HarmonicLogo } from "@/components/HarmonicLogo";
import { DocumentSidebar } from "@/components/DocumentSidebar";
import { SaveDialog } from "@/components/SaveDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { useDocuments } from "@/hooks/useDocuments";

export default function Home() {
  const { data: session } = useSession();
  const {
    documents,
    folders,
    sharedDocuments,
    currentDocument,
    currentSharedPermission,
    isLoading,
    isSaving,
    sortBy,
    sortOrder,
    error,
    expandedFolders,
    setSortBy,
    setSortOrder,
    openDocument,
    openSharedDocument,
    saveDocument,
    deleteDocument,
    newDocument,
    createFolder,
    deleteFolder,
    toggleFolderExpand,
    shareDocument,
    unshareDocument,
    fetchSharesForDocument,
    clearError,
  } = useDocuments();

  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<"view" | "edit">("edit");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ id: string; name: string } | null>(null);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState<{ parentId: string | null } | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    if (currentDocument) setMarkdown(currentDocument.content);
  }, [currentDocument]);

  const handlePaste = useCallback(() => { setMode("edit"); }, []);

  const handleSave = useCallback(() => {
    if (currentDocument) {
      saveDocument(currentDocument.name, markdown);
    } else {
      setShowSaveDialog(true);
    }
  }, [currentDocument, markdown, saveDocument]);

  const handleSaveDialogConfirm = useCallback(
    async (name: string) => {
      const result = await saveDocument(name, markdown);
      if (result) setShowSaveDialog(false);
    },
    [markdown, saveDocument]
  );

  const handleOpenDocument = useCallback(
    async (id: string) => {
      const doc = await openDocument(id);
      if (doc) { setMarkdown(doc.content); setMode("view"); }
    },
    [openDocument]
  );

  const handleNewDocument = useCallback(() => {
    newDocument();
    setMarkdown("");
    setMode("edit");
  }, [newDocument]);

  const handleDeleteConfirm = useCallback(async () => {
    if (showDeleteDialog) {
      await deleteDocument(showDeleteDialog.id);
      if (currentDocument?.id === showDeleteDialog.id) setMarkdown("");
      setShowDeleteDialog(null);
    }
  }, [showDeleteDialog, deleteDocument, currentDocument]);

  const handleCreateFolderConfirm = useCallback(async (name: string) => {
    if (showCreateFolderDialog !== null) {
      const result = await createFolder(name, showCreateFolderDialog.parentId);
      if (result) setShowCreateFolderDialog(null);
    }
  }, [showCreateFolderDialog, createFolder]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const isDirty = currentDocument !== null
    ? markdown !== currentDocument.content
    : markdown.length > 0;

  const isOwner = currentSharedPermission === "owner";
  const canEdit = currentSharedPermission === "owner" || currentSharedPermission === "edit";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fff" }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 h-14 border-b shrink-0"
        style={{ background: "#fff", borderColor: "#000" }}
      >
        <div className="flex items-center gap-3">
          <HarmonicLogo />
          <span className="shell-label px-2 py-0.5" style={{ background: "#000", color: "#fff" }}>
            SCOUT
          </span>
          {currentDocument && (
            <>
              <div className="h-4 w-px" style={{ background: "#000" }} />
              <span className="text-xs font-medium" style={{ color: "#000" }}>
                {currentDocument.name}
              </span>
              {!isOwner && (
                <span
                  className="shell-label px-1.5 py-0.5"
                  style={{
                    fontSize: "9px",
                    background: canEdit ? "#005eff" : "#f0f0f0",
                    color: canEdit ? "#fff" : "#000",
                  }}
                >
                  {currentSharedPermission.toUpperCase()}
                </span>
              )}
              {isDirty && (
                <span className="text-xs" style={{ color: "#A6A6A6" }}>(unsaved)</span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={isSaving || (!isDirty && currentDocument !== null)}
              className="shell-label px-3 py-1.5 transition-colors cursor-pointer"
              style={{
                background: isSaving || (!isDirty && currentDocument !== null) ? "#99c2ff" : "#005eff",
                color: "#fff",
                fontSize: "11px",
              }}
            >
              {isSaving ? "SAVING..." : "SAVE"}
            </button>
          )}
          {isOwner && currentDocument && (
            <>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="shell-label px-3 py-1.5 transition-colors cursor-pointer border"
                style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
              >
                SAVE AS
              </button>
              <button
                onClick={() => setShowShareDialog(true)}
                className="shell-label px-3 py-1.5 transition-colors cursor-pointer border"
                style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
              >
                SHARE
              </button>
            </>
          )}
          <button
            onClick={() => setMode(mode === "view" ? "edit" : "view")}
            className="shell-label px-3 py-1.5 transition-colors cursor-pointer border"
            style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
          >
            {mode === "edit" ? "PREVIEW" : canEdit ? "EDIT" : "VIEW SOURCE"}
          </button>
          {mode === "edit" && canEdit && (
            <button
              onClick={() => setMarkdown("")}
              className="shell-label px-3 py-1.5 transition-colors cursor-pointer border"
              style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
            >
              CLEAR
            </button>
          )}
          {session?.user && (
            <>
              <div className="h-4 w-px mx-1" style={{ background: "#000" }} />
              <span className="text-xs" style={{ color: "#A6A6A6" }}>{session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="shell-label px-3 py-1.5 transition-colors cursor-pointer border"
                style={{ background: "#fff", color: "#000", borderColor: "#000", fontSize: "11px" }}
              >
                SIGN OUT
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main area with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <DocumentSidebar
          documents={documents}
          folders={folders}
          sharedDocuments={sharedDocuments}
          currentDocumentId={currentDocument?.id || null}
          expandedFolders={expandedFolders}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isLoading={isLoading}
          onOpenDocument={handleOpenDocument}
          onOpenSharedDocument={(doc) => {
            openSharedDocument(doc);
            setMarkdown(doc.content);
            setMode("view");
          }}
          onNewDocument={handleNewDocument}
          onDeleteDocument={(id, name) => setShowDeleteDialog({ id, name })}
          onDeleteFolder={deleteFolder}
          onCreateFolder={(parentId) => setShowCreateFolderDialog({ parentId })}
          onToggleFolderExpand={toggleFolderExpand}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content */}
        <main className="flex-1 flex justify-center py-8 px-6 overflow-y-auto">
          <div
            className="w-full border"
            style={{ maxWidth: "900px", background: "#fff", borderColor: "#000" }}
          >
            {mode === "edit" ? (
              <textarea
                className="markdown-input w-full h-full min-h-[80vh] p-8 border-0"
                style={{ background: "#fff" }}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onPaste={handlePaste}
                placeholder="Paste your Harmonic markdown output here..."
                spellCheck={false}
                readOnly={!canEdit}
              />
            ) : (
              <div className="harmonic-content p-8">
                {markdown ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="table-wrapper"><table>{children}</table></div>
                      ),
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                      ),
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="shell-label mb-2" style={{ color: "#A6A6A6", fontSize: "12px" }}>
                      NO CONTENT YET
                    </div>
                    <div className="text-xs" style={{ color: "#A6A6A6" }}>
                      Start typing or paste your Harmonic markdown output
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Error toast */}
      {error && (
        <div
          className="fixed bottom-4 right-4 px-4 py-2 text-xs font-medium flex items-center gap-2 border"
          style={{ background: "#fff", color: "#dc2626", borderColor: "#dc2626" }}
        >
          {error}
          <button onClick={clearError} className="cursor-pointer" style={{ color: "#dc2626" }}>x</button>
        </div>
      )}

      <SaveDialog
        isOpen={showSaveDialog}
        initialName={currentDocument?.name || ""}
        onSave={handleSaveDialogConfirm}
        onCancel={() => { setShowSaveDialog(false); clearError(); }}
        error={error}
      />

      <DeleteConfirmDialog
        isOpen={!!showDeleteDialog}
        documentName={showDeleteDialog?.name || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(null)}
      />

      <CreateFolderDialog
        isOpen={!!showCreateFolderDialog}
        parentFolderName={
          showCreateFolderDialog?.parentId
            ? folders.find((f) => f.id === showCreateFolderDialog.parentId)?.name || null
            : null
        }
        onSave={handleCreateFolderConfirm}
        onCancel={() => { setShowCreateFolderDialog(null); clearError(); }}
        error={error}
      />

      {currentDocument && (
        <ShareDialog
          isOpen={showShareDialog}
          documentId={currentDocument.id}
          documentName={currentDocument.name}
          onClose={() => { setShowShareDialog(false); clearError(); }}
          onShare={shareDocument}
          onUnshare={unshareDocument}
          fetchShares={fetchSharesForDocument}
          error={error}
          clearError={clearError}
        />
      )}
    </div>
  );
}
