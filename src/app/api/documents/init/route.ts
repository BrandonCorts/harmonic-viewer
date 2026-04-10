import { auth } from "@/auth";
import { initializeDatabase } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initializeDatabase();
  return Response.json({ ok: true });
}
