"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HarmonicLogo } from "@/components/HarmonicLogo";
import { DocumentSidebar } from "@/components/DocumentSidebar";
import { SaveDialog } from "@/components/SaveDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useDocuments } from "@/hooks/useDocuments";

export default function Home() {
  const { data: session } = useSession();
  const {
    documents,
    currentDocument,
    isLoading,
    isSaving,
    sortBy,
    sortOrder,
    error,
    setSortBy,
    setSortOrder,
    openDocument,
    saveDocument,
    deleteDocument,
    newDocument,
    clearError,
  } = useDocuments();

  const [markdown, setMarkdown] = useState("");
  const [mode, setMode] = useState<"view" | "edit">("edit");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Sync markdown state when opening a document
  useEffect(() => {
    if (currentDocument) {
      setMarkdown(currentDocument.content);
    }
  }, [currentDocument]);

  const handlePaste = useCallback(() => {
    setMode("edit");
  }, []);

  const handleSave = useCallback(() => {
    if (currentDocument) {
      // Already has a name, save directly
      saveDocument(currentDocument.name, markdown);
    } else {
      // New document, prompt for name
      setShowSaveDialog(true);
    }
  }, [currentDocument, markdown, saveDocument]);

  const handleSaveAs = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  const handleSaveDialogConfirm = useCallback(
    async (name: string) => {
      const result = await saveDocument(name, markdown);
      if (result) {
        setShowSaveDialog(false);
      }
    },
    [markdown, saveDocument]
  );

  const handleOpenDocument = useCallback(
    async (id: string) => {
      const doc = await openDocument(id);
      if (doc) {
        setMarkdown(doc.content);
        setMode("view");
      }
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
      if (currentDocument?.id === showDeleteDialog.id) {
        setMarkdown("");
      }
      setShowDeleteDialog(null);
    }
  }, [showDeleteDialog, deleteDocument, currentDocument]);

  // Keyboard shortcut: Cmd+S to save
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

  const isDirty =
    currentDocument !== null
      ? markdown !== currentDocument.content
      : markdown.length > 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f8f9fa" }}
    >
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 h-14 border-b shrink-0"
        style={{ background: "#ffffff", borderColor: "#e5e7eb" }}
      >
        <div className="flex items-center gap-3">
          <HarmonicLogo />
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ background: "#f3f4f6", color: "#6b7280" }}
          >
            Ask Scout
          </span>
          {currentDocument && (
            <>
              <div
                className="h-4 w-px"
                style={{ background: "#e5e7eb" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "#374151" }}
              >
                {currentDocument.name}
              </span>
              {isDirty && (
                <span
                  className="text-xs"
                  style={{ color: "#9ca3af" }}
                >
                  (unsaved)
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || (!isDirty && currentDocument !== null)}
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{
              background:
                isSaving || (!isDirty && currentDocument !== null)
                  ? "#c7d2fe"
                  : "#6366f1",
              color: "#ffffff",
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          {currentDocument && (
            <button
              onClick={handleSaveAs}
              className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              style={{ background: "#f3f4f6", color: "#374151" }}
            >
              Save As
            </button>
          )}
          <button
            onClick={() => setMode(mode === "view" ? "edit" : "view")}
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{
              background: mode === "edit" ? "#f3f4f6" : "#f3f4f6",
              color: "#374151",
            }}
          >
            {mode === "edit" ? "Preview" : "Edit"}
          </button>
          {mode === "edit" && (
            <button
              onClick={() => setMarkdown("")}
              className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              style={{ background: "#f3f4f6", color: "#374151" }}
            >
              Clear
            </button>
          )}
          {session?.user && (
            <>
              <div
                className="h-4 w-px mx-1"
                style={{ background: "#e5e7eb" }}
              />
              <span className="text-xs" style={{ color: "#6b7280" }}>
                {session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                style={{ background: "#f3f4f6", color: "#374151" }}
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main area with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <DocumentSidebar
          documents={documents}
          currentDocumentId={currentDocument?.id || null}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isLoading={isLoading}
          onOpenDocument={handleOpenDocument}
          onNewDocument={handleNewDocument}
          onDeleteDocument={(id, name) => setShowDeleteDialog({ id, name })}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content */}
        <main className="flex-1 flex justify-center py-8 px-4 overflow-y-auto">
          <div
            className="w-full rounded-lg border shadow-sm"
            style={{
              maxWidth: "900px",
              background: "#ffffff",
              borderColor: "#e5e7eb",
            }}
          >
            {mode === "edit" ? (
              <textarea
                className="markdown-input w-full h-full min-h-[80vh] p-8 rounded-lg border-0"
                style={{ background: "#ffffff" }}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onPaste={handlePaste}
                placeholder="Paste your Harmonic markdown output here..."
                spellCheck={false}
              />
            ) : (
              <div className="harmonic-content p-8">
                {markdown ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="table-wrapper">
                          <table>{children}</table>
                        </div>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {markdown}
                  </ReactMarkdown>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div
                      className="text-sm font-medium mb-2"
                      style={{ color: "#6b7280" }}
                    >
                      No content yet
                    </div>
                    <div className="text-xs" style={{ color: "#9ca3af" }}>
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
          className="fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-xs font-medium flex items-center gap-2"
          style={{
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          {error}
          <button
            onClick={clearError}
            className="cursor-pointer"
            style={{ color: "#dc2626" }}
          >
            x
          </button>
        </div>
      )}

      {/* Save dialog */}
      <SaveDialog
        isOpen={showSaveDialog}
        initialName={currentDocument?.name || ""}
        onSave={handleSaveDialogConfirm}
        onCancel={() => {
          setShowSaveDialog(false);
          clearError();
        }}
        error={error}
      />

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        isOpen={!!showDeleteDialog}
        documentName={showDeleteDialog?.name || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(null)}
      />
    </div>
  );
}
