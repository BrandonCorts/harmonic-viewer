import { auth } from "@/auth";
import { listFolders, createFolder } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const folders = await listFolders(session.user.email);
  return Response.json(folders);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, parentId } = await request.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const folder = await createFolder(session.user.email, name.trim(), parentId || null);
    return Response.json(folder, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return Response.json({ error: "A folder with this name already exists here" }, { status: 409 });
    }
    throw error;
  }
}
