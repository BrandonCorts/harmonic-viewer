import { auth } from "@/auth";
import { listSharedWithMe } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await listSharedWithMe(session.user.email);
  return Response.json(documents);
}
