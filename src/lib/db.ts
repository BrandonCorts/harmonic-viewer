import { neon } from "@neondatabase/serverless";

function getSQL() {
  return neon(process.env.DATABASE_URL!);
}

// --- Types ---

export interface Document {
  id: string;
  user_email: string;
  name: string;
  content: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentListItem {
  id: string;
  name: string;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
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

// --- Database Initialization ---

export async function initializeDatabase() {
  const sql = getSQL();

  // Documents table
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_email VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_documents_user_email ON documents (user_email)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_user_name ON documents (user_email, name)`;

  // Folders table
  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_email VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_folders_user_email ON folders (user_email)`;

  // Add folder_id column to documents if not exists
  await sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL`;

  // Shares table
  await sql`
    CREATE TABLE IF NOT EXISTS shares (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      shared_by VARCHAR(255) NOT NULL,
      shared_with VARCHAR(255) NOT NULL,
      permission VARCHAR(20) NOT NULL DEFAULT 'view',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_shares_doc_user ON shares (document_id, shared_with)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_shares_shared_with ON shares (shared_with)`;
}

// --- Document Queries ---

export async function listDocuments(
  userEmail: string,
  sortBy: string = "updated_at",
  sortOrder: string = "desc"
): Promise<DocumentListItem[]> {
  const sql = getSQL();
  const allowedSortBy = ["name", "created_at", "updated_at"];
  const allowedSortOrder = ["asc", "desc"];
  const safeSort = allowedSortBy.includes(sortBy) ? sortBy : "updated_at";
  const safeOrder = allowedSortOrder.includes(sortOrder) ? sortOrder : "desc";

  if (safeSort === "name" && safeOrder === "asc") {
    return await sql`SELECT id, name, folder_id, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY name ASC` as DocumentListItem[];
  } else if (safeSort === "name" && safeOrder === "desc") {
    return await sql`SELECT id, name, folder_id, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY name DESC` as DocumentListItem[];
  } else if (safeSort === "created_at" && safeOrder === "asc") {
    return await sql`SELECT id, name, folder_id, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY created_at ASC` as DocumentListItem[];
  } else if (safeSort === "created_at" && safeOrder === "desc") {
    return await sql`SELECT id, name, folder_id, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY created_at DESC` as DocumentListItem[];
  } else if (safeSort === "updated_at" && safeOrder === "asc") {
    return await sql`SELECT id, name, folder_id, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY updated_at ASC` as DocumentListItem[];
  } else {
    return await sql`SELECT id, name, folder_id, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY updated_at DESC` as DocumentListItem[];
  }
}

export async function getDocument(
  id: string,
  userEmail: string
): Promise<Document | null> {
  const sql = getSQL();
  // Check ownership first
  const rows = await sql`
    SELECT id, user_email, name, content, folder_id, created_at, updated_at
    FROM documents
    WHERE id = ${id} AND user_email = ${userEmail}
  `;
  if (rows[0]) return rows[0] as Document;

  // Check if shared with user
  const shared = await sql`
    SELECT d.id, d.user_email, d.name, d.content, d.folder_id, d.created_at, d.updated_at
    FROM documents d
    JOIN shares s ON s.document_id = d.id
    WHERE d.id = ${id} AND s.shared_with = ${userEmail}
  `;
  return (shared[0] as Document) || null;
}

export async function createDocument(
  userEmail: string,
  name: string,
  content: string,
  folderId: string | null = null
): Promise<Document> {
  const sql = getSQL();
  if (folderId) {
    const rows = await sql`
      INSERT INTO documents (user_email, name, content, folder_id)
      VALUES (${userEmail}, ${name}, ${content}, ${folderId})
      RETURNING id, user_email, name, content, folder_id, created_at, updated_at
    `;
    return rows[0] as Document;
  }
  const rows = await sql`
    INSERT INTO documents (user_email, name, content)
    VALUES (${userEmail}, ${name}, ${content})
    RETURNING id, user_email, name, content, folder_id, created_at, updated_at
  `;
  return rows[0] as Document;
}

export async function updateDocument(
  id: string,
  userEmail: string,
  name: string,
  content: string
): Promise<Document | null> {
  const sql = getSQL();
  // Try owner update
  const rows = await sql`
    UPDATE documents
    SET name = ${name}, content = ${content}, updated_at = NOW()
    WHERE id = ${id} AND user_email = ${userEmail}
    RETURNING id, user_email, name, content, folder_id, created_at, updated_at
  `;
  if (rows[0]) return rows[0] as Document;

  // Try shared edit update
  const shareCheck = await sql`
    SELECT s.permission FROM shares s WHERE s.document_id = ${id} AND s.shared_with = ${userEmail} AND s.permission = 'edit'
  `;
  if (shareCheck.length > 0) {
    const updated = await sql`
      UPDATE documents
      SET content = ${content}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, user_email, name, content, folder_id, created_at, updated_at
    `;
    return (updated[0] as Document) || null;
  }

  return null;
}

export async function deleteDocument(
  id: string,
  userEmail: string
): Promise<boolean> {
  const sql = getSQL();
  const rows = await sql`
    DELETE FROM documents
    WHERE id = ${id} AND user_email = ${userEmail}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function moveDocument(
  id: string,
  userEmail: string,
  folderId: string | null
): Promise<Document | null> {
  const sql = getSQL();
  if (folderId) {
    const rows = await sql`
      UPDATE documents SET folder_id = ${folderId}, updated_at = NOW()
      WHERE id = ${id} AND user_email = ${userEmail}
      RETURNING id, user_email, name, content, folder_id, created_at, updated_at
    `;
    return (rows[0] as Document) || null;
  }
  const rows = await sql`
    UPDATE documents SET folder_id = NULL, updated_at = NOW()
    WHERE id = ${id} AND user_email = ${userEmail}
    RETURNING id, user_email, name, content, folder_id, created_at, updated_at
  `;
  return (rows[0] as Document) || null;
}

// --- Folder Queries ---

export async function listFolders(userEmail: string): Promise<Folder[]> {
  const sql = getSQL();
  return await sql`
    SELECT id, user_email, name, parent_id, created_at, updated_at
    FROM folders WHERE user_email = ${userEmail} ORDER BY name ASC
  ` as Folder[];
}

export async function createFolder(
  userEmail: string,
  name: string,
  parentId: string | null = null
): Promise<Folder> {
  const sql = getSQL();
  if (parentId) {
    const rows = await sql`
      INSERT INTO folders (user_email, name, parent_id)
      VALUES (${userEmail}, ${name}, ${parentId})
      RETURNING id, user_email, name, parent_id, created_at, updated_at
    `;
    return rows[0] as Folder;
  }
  const rows = await sql`
    INSERT INTO folders (user_email, name)
    VALUES (${userEmail}, ${name})
    RETURNING id, user_email, name, parent_id, created_at, updated_at
  `;
  return rows[0] as Folder;
}

export async function updateFolder(
  id: string,
  userEmail: string,
  name: string
): Promise<Folder | null> {
  const sql = getSQL();
  const rows = await sql`
    UPDATE folders SET name = ${name}, updated_at = NOW()
    WHERE id = ${id} AND user_email = ${userEmail}
    RETURNING id, user_email, name, parent_id, created_at, updated_at
  `;
  return (rows[0] as Folder) || null;
}

export async function deleteFolder(
  id: string,
  userEmail: string
): Promise<boolean> {
  const sql = getSQL();
  const rows = await sql`
    DELETE FROM folders WHERE id = ${id} AND user_email = ${userEmail} RETURNING id
  `;
  return rows.length > 0;
}

// --- Share Queries ---

export async function listShares(
  documentId: string,
  ownerEmail: string
): Promise<Share[]> {
  const sql = getSQL();
  return await sql`
    SELECT s.id, s.document_id, s.shared_by, s.shared_with, s.permission, s.created_at
    FROM shares s
    JOIN documents d ON d.id = s.document_id
    WHERE s.document_id = ${documentId} AND d.user_email = ${ownerEmail}
    ORDER BY s.created_at DESC
  ` as Share[];
}

export async function createShare(
  documentId: string,
  sharedBy: string,
  sharedWith: string,
  permission: string = "view"
): Promise<Share> {
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO shares (document_id, shared_by, shared_with, permission)
    VALUES (${documentId}, ${sharedBy}, ${sharedWith}, ${permission})
    RETURNING id, document_id, shared_by, shared_with, permission, created_at
  `;
  return rows[0] as Share;
}

export async function deleteShare(
  shareId: string,
  ownerEmail: string
): Promise<boolean> {
  const sql = getSQL();
  const rows = await sql`
    DELETE FROM shares WHERE id = ${shareId} AND shared_by = ${ownerEmail} RETURNING id
  `;
  return rows.length > 0;
}

export async function listSharedWithMe(
  userEmail: string
): Promise<SharedDocument[]> {
  const sql = getSQL();
  return await sql`
    SELECT d.id, d.name, d.content, d.user_email as owner_email,
           s.permission, s.created_at as shared_at, d.updated_at
    FROM shares s
    JOIN documents d ON d.id = s.document_id
    WHERE s.shared_with = ${userEmail}
    ORDER BY d.updated_at DESC
  ` as SharedDocument[];
}

export async function getSharePermission(
  documentId: string,
  userEmail: string
): Promise<"view" | "edit" | null> {
  const sql = getSQL();
  const rows = await sql`
    SELECT permission FROM shares WHERE document_id = ${documentId} AND shared_with = ${userEmail}
  `;
  if (rows[0]) return rows[0].permission as "view" | "edit";
  return null;
}
