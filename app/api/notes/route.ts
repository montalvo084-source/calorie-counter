import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 0; // Disable caching for this route

export async function GET() {
  const notes = await db.note.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const note = await db.note.create({
    data: { body: String(body.body ?? "").trim() },
  });
  return NextResponse.json(note, { status: 201 });
}
