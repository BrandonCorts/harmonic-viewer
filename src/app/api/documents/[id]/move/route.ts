import { auth } from "@/auth";
import { moveDocument } from "@/lib/db";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { folderId } = await request.json();

  const document = await moveDocument(id, session.user.email, folderId || null);
  if (!document) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(document);
}
