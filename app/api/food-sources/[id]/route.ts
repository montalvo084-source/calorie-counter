import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const source = await db.foodSource.update({
    where: { id: Number(id) },
    data: {
      label: body.label ?? undefined,
      calories: body.calories != null ? Number(body.calories) : undefined,
      protein: body.protein != null ? Number(body.protein) : undefined,
      fiber: body.fiber != null ? Number(body.fiber) : undefined,
      waterGlasses: body.waterGlasses != null ? Number(body.waterGlasses) : undefined,
      unit: body.unit ?? undefined,
      emoji: body.emoji ?? undefined,
      active: body.active != null ? Boolean(body.active) : undefined,
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : undefined,
    },
  });
  return NextResponse.json(source);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.foodSource.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
