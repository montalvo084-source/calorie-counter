import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 0; // Disable caching for this route

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const log = await db.dailyLog.findUnique({
    where: { date },
    include: { entries: true },
  });
  if (!log) return NextResponse.json(null);
  return NextResponse.json(log);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  await db.dailyLog.deleteMany({ where: { date } });
  return NextResponse.json({ ok: true });
}
