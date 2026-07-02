import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 0; // Disable caching for this route

export async function GET() {
  const logs = await db.dailyLog.findMany({
    include: { entries: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, entries = [], note, waterGlasses } = body;

  const existing = await db.dailyLog.findUnique({ where: { date } });

  let log;
  if (existing) {
    await db.calorieEntry.deleteMany({ where: { logId: existing.id } });
    log = await db.dailyLog.update({
      where: { date },
      data: {
        note: note ?? null,
        waterGlasses: waterGlasses != null ? Number(waterGlasses) : existing.waterGlasses,
        entries: {
          create: entries
            .filter((e: { quantity: number }) => e.quantity > 0)
            .map((e: { sourceKey: string; quantity: number }) => ({
              sourceKey: e.sourceKey,
              quantity: Number(e.quantity),
            })),
        },
      },
      include: { entries: true },
    });
  } else {
    log = await db.dailyLog.create({
      data: {
        date,
        note: note ?? null,
        waterGlasses: waterGlasses != null ? Number(waterGlasses) : 0,
        entries: {
          create: entries
            .filter((e: { quantity: number }) => e.quantity > 0)
            .map((e: { sourceKey: string; quantity: number }) => ({
              sourceKey: e.sourceKey,
              quantity: Number(e.quantity),
            })),
        },
      },
      include: { entries: true },
    });
  }

  return NextResponse.json(log, { status: existing ? 200 : 201 });
}
