"use client";

import { useState, useCallback, useEffect } from "react";

export interface DocumentListItem {
  id: string;
  name: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document extends DocumentListItem {
  user_email: string;
  content: string;
}

export interface Folder {
  id: string;
  user_email: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: string;
  document_id: string;
  shared_by: string;
  shared_with: string;
  permission: "view" | "edit";
  created_at: string;
}

export interface SharedDocument {
  id: string;
  name: string;
  content: string;
  owner_email: string;
  permission: "view" | "edit";
  shared_at: string;
  updated_at: string;
}

export type SortBy = "name" | "created_at" | "updated_at";
export type SortOrder = "asc" | "desc";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [currentSharedPermission, setCurrentSharedPermission] = useState<"view" | "edit" | "owner">("owner");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [error, setError] = useState<string | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const initDb = useCallback(async () => {
    try {
      await fetch("/api/documents/init", { method: "POST" });
      setDbInitialized(true);
    } catch {
      setDbInitialized(true);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (!res.ok) throw new Error("Failed to fetch documents");
      setDocuments(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, sortOrder]);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      if (res.ok) setFolders(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchSharedDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents/shared");
      if (res.ok) setSharedDocuments(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchDocuments(), fetchFolders(), fetchSharedDocuments()]);
  }, [fetchDocuments, fetchFolders, fetchSharedDocuments]);

  const openDocument = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) throw new Error("Failed to load document");
      const doc = await res.json();
      setCurrentDocument(doc);
      setCurrentSharedPermission("owner");
      return doc as Document;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openSharedDocument = useCallback(async (doc: SharedDocument) => {
    setCurrentDocument({
      id: doc.id,
      user_email: doc.owner_email,
      name: doc.name,
      content: doc.content,
      folder_id: null,
      created_at: doc.shared_at,
      updated_at: doc.updated_at,
    });
    setCurrentSharedPermission(doc.permission);
    return doc;
  }, []);

  const saveDocument = useCallback(
    async (name: string, content: string, folderId?: string | null) => {
      setIsSaving(true);
      setError(null);
      try {
        if (currentDocument) {
          const res = await fetch(`/api/documents/${currentDocument.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, content }),
          });
          if (res.status === 409) { setError("A document with this name already exists"); return null; }
          if (!res.ok) throw new Error("Failed to save document");
          const doc = await res.json();
          setCurrentDocument(doc);
          await fetchAll();
          return doc as Document;
        } else {
          const res = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, content, folderId: folderId || null }),
          });
          if (res.status === 409) { setError("A document with this name already exists"); return null; }
          if (!res.ok) throw new Error("Failed to create document");
          const doc = await res.json();
          setCurrentDocument(doc);
          setCurrentSharedPermission("owner");
          await fetchAll();
          return doc as Document;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [currentDocument, fetchAll]
  );

  const deleteDoc = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
        if (!res.ok && res.status !== 204) throw new Error("Failed to delete document");
        if (currentDocument?.id === id) setCurrentDocument(null);
        await fetchAll();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
        return false;
      }
    },
    [currentDocument, fetchAll]
  );

  const newDocument = useCallback(() => {
    setCurrentDocument(null);
    setCurrentSharedPermission("owner");
    setError(null);
  }, []);

  // Folder operations
  const createNewFolder = useCallback(async (name: string, parentId: string | null = null) => {
    setError(null);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId }),
      });
      if (res.status === 409) { setError("A folder with this name already exists"); return null; }
      if (!res.ok) throw new Error("Failed to create folder");
      const folder = await res.json();
      await fetchFolders();
      return folder as Folder;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
      return null;
    }
  }, [fetchFolders]);

  const renameFolder = useCallback(async (id: string, name: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename folder");
      await fetchFolders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename folder");
    }
  }, [fetchFolders]);

  const deleteFolderAction = useCallback(async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete folder");
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete folder");
    }
  }, [fetchAll]);

  const moveDoc = useCallback(async (docId: string, folderId: string | null) => {
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!res.ok) throw new Error("Failed to move document");
      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move document");
    }
  }, [fetchDocuments]);

  const toggleFolderExpand = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }, []);

  // Share operations
  const shareDocument = useCallback(async (docId: string, email: string, permission: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, permission }),
      });
      if (res.status === 409) { setError("Already shared with this user"); return null; }
      if (res.status === 400) { const d = await res.json(); setError(d.error); return null; }
      if (!res.ok) throw new Error("Failed to share");
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share");
      return null;
    }
  }, []);

  const unshareDocument = useCallback(async (docId: string, shareId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/shares/${shareId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to unshare");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unshare");
    }
  }, []);

  const fetchSharesForDocument = useCallback(async (docId: string): Promise<Share[]> => {
    try {
      const res = await fetch(`/api/documents/${docId}/shares`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }, []);

  // Initialize
  useEffect(() => {
    if (!dbInitialized) {
      initDb().then(() => fetchAll());
    }
  }, [dbInitialized, initDb, fetchAll]);

  useEffect(() => {
    if (dbInitialized) fetchDocuments();
  }, [sortBy, sortOrder, dbInitialized, fetchDocuments]);

  return {
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
    fetchDocuments,
    openDocument,
    openSharedDocument,
    saveDocument,
    deleteDocument: deleteDoc,
    newDocument,
    createFolder: createNewFolder,
    renameFolder,
    deleteFolder: deleteFolderAction,
    moveDocument: moveDoc,
    toggleFolderExpand,
    shareDocument,
    unshareDocument,
    fetchSharesForDocument,
    clearError: () => setError(null),
  };
}
