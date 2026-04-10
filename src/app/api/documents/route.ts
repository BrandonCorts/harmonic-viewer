import { auth } from "@/auth";
import { listDocuments, createDocument } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const sortBy = searchParams.get("sortBy") || "updated_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const documents = await listDocuments(session.user.email, sortBy, sortOrder);
  return Response.json(documents);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, content } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const document = await createDocument(
      session.user.email,
      name.trim(),
      content || ""
    );
    return Response.json(document, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    if (message.includes("idx_documents_user_name")) {
      return Response.json(
        { error: "A document with this name already exists" },
        { status: 409 }
      );
    }
    throw error;
  }
}
