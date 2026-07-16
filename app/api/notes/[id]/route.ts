import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 0; // Disable caching for this route

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.note.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
