"use client";

import { useState, useCallback, useEffect } from "react";

export interface DocumentListItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Document extends DocumentListItem {
  user_email: string;
  content: string;
}

export type SortBy = "name" | "created_at" | "updated_at";
export type SortOrder = "asc" | "desc";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [error, setError] = useState<string | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false);

  const initDb = useCallback(async () => {
    try {
      await fetch("/api/documents/init", { method: "POST" });
      setDbInitialized(true);
    } catch {
      // DB might already be initialized
      setDbInitialized(true);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/documents?sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, sortOrder]);

  const openDocument = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) throw new Error("Failed to load document");
      const doc = await res.json();
      setCurrentDocument(doc);
      return doc as Document;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveDocument = useCallback(
    async (name: string, content: string) => {
      setIsSaving(true);
      setError(null);
      try {
        if (currentDocument) {
          // Update existing
          const res = await fetch(`/api/documents/${currentDocument.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, content }),
          });
          if (res.status === 409) {
            setError("A document with this name already exists");
            return null;
          }
          if (!res.ok) throw new Error("Failed to save document");
          const doc = await res.json();
          setCurrentDocument(doc);
          await fetchDocuments();
          return doc as Document;
        } else {
          // Create new
          const res = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, content }),
          });
          if (res.status === 409) {
            setError("A document with this name already exists");
            return null;
          }
          if (!res.ok) throw new Error("Failed to create document");
          const doc = await res.json();
          setCurrentDocument(doc);
          await fetchDocuments();
          return doc as Document;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [currentDocument, fetchDocuments]
  );

  const deleteDoc = useCallback(
    async (id: string) => {
      setError(null);
      try {
        const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
        if (!res.ok && res.status !== 204)
          throw new Error("Failed to delete document");
        if (currentDocument?.id === id) {
          setCurrentDocument(null);
        }
        await fetchDocuments();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
        return false;
      }
    },
    [currentDocument, fetchDocuments]
  );

  const newDocument = useCallback(() => {
    setCurrentDocument(null);
    setError(null);
  }, []);

  // Initialize DB and fetch documents on mount
  useEffect(() => {
    if (!dbInitialized) {
      initDb().then(() => fetchDocuments());
    }
  }, [dbInitialized, initDb, fetchDocuments]);

  // Re-fetch when sort changes
  useEffect(() => {
    if (dbInitialized) {
      fetchDocuments();
    }
  }, [sortBy, sortOrder, dbInitialized, fetchDocuments]);

  return {
    documents,
    currentDocument,
    isLoading,
    isSaving,
    sortBy,
    sortOrder,
    error,
    setSortBy,
    setSortOrder,
    fetchDocuments,
    openDocument,
    saveDocument,
    deleteDocument: deleteDoc,
    newDocument,
    clearError: () => setError(null),
  };
}
