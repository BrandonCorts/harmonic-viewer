import { neon } from "@neondatabase/serverless";

function getSQL() {
  return neon(process.env.DATABASE_URL!);
}

export interface Document {
  id: string;
  user_email: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentListItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function initializeDatabase() {
  const sql = getSQL();
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
  await sql`
    CREATE INDEX IF NOT EXISTS idx_documents_user_email ON documents (user_email)
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_user_name ON documents (user_email, name)
  `;
}

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

  // Use separate queries per sort combination since tagged templates can't interpolate ORDER BY
  if (safeSort === "name" && safeOrder === "asc") {
    return await sql`SELECT id, name, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY name ASC` as DocumentListItem[];
  } else if (safeSort === "name" && safeOrder === "desc") {
    return await sql`SELECT id, name, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY name DESC` as DocumentListItem[];
  } else if (safeSort === "created_at" && safeOrder === "asc") {
    return await sql`SELECT id, name, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY created_at ASC` as DocumentListItem[];
  } else if (safeSort === "created_at" && safeOrder === "desc") {
    return await sql`SELECT id, name, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY created_at DESC` as DocumentListItem[];
  } else if (safeSort === "updated_at" && safeOrder === "asc") {
    return await sql`SELECT id, name, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY updated_at ASC` as DocumentListItem[];
  } else {
    return await sql`SELECT id, name, created_at, updated_at FROM documents WHERE user_email = ${userEmail} ORDER BY updated_at DESC` as DocumentListItem[];
  }
}

export async function getDocument(
  id: string,
  userEmail: string
): Promise<Document | null> {
  const sql = getSQL();
  const rows = await sql`
    SELECT id, user_email, name, content, created_at, updated_at
    FROM documents
    WHERE id = ${id} AND user_email = ${userEmail}
  `;
  return (rows[0] as Document) || null;
}

export async function createDocument(
  userEmail: string,
  name: string,
  content: string
): Promise<Document> {
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO documents (user_email, name, content)
    VALUES (${userEmail}, ${name}, ${content})
    RETURNING id, user_email, name, content, created_at, updated_at
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
  const rows = await sql`
    UPDATE documents
    SET name = ${name}, content = ${content}, updated_at = NOW()
    WHERE id = ${id} AND user_email = ${userEmail}
    RETURNING id, user_email, name, content, created_at, updated_at
  `;
  return (rows[0] as Document) || null;
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
