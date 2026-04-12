import { auth } from "@/auth";
import { listShares, createShare } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const shares = await listShares(id, session.user.email);
  return Response.json(shares);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { email, permission } = await request.json();

  if (!email || typeof email !== "string" || !email.endsWith("@newlab.com")) {
    return Response.json({ error: "Must be a valid @newlab.com email" }, { status: 400 });
  }

  if (email === session.user.email) {
    return Response.json({ error: "Cannot share with yourself" }, { status: 400 });
  }

  const validPermission = permission === "edit" ? "edit" : "view";

  try {
    const share = await createShare(id, session.user.email, email, validPermission);
    return Response.json(share, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("idx_shares_doc_user")) {
      return Response.json({ error: "Already shared with this user" }, { status: 409 });
    }
    throw error;
  }
}
