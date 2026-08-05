import { getSessionFromCookies } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const roadmap = await db.roadmap.findFirst({
    where: { id, userId: session.userId },
  });

  if (!roadmap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(roadmap);
}
