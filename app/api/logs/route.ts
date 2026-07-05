import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 0; // Disable caching for this route

interface RawEntry {
  sourceKey?: string | null;
  quantity?: number;
  label?: string;
  calories?: number;
  protein?: number;
  fiber?: number;
}

function toEntryCreateData(entries: RawEntry[]) {
  return entries
    .filter((e) => (e.sourceKey ? Number(e.quantity) > 0 : Number(e.calories) > 0))
    .map((e) =>
      e.sourceKey
        ? { sourceKey: e.sourceKey, quantity: Number(e.quantity) }
        : {
            sourceKey: null,
            quantity: 1,
            label: e.label || null,
            calories: Math.round(Number(e.calories)),
            protein: e.protein != null ? Number(e.protein) : null,
            fiber: e.fiber != null ? Number(e.fiber) : null,
          }
    );
}

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
          create: toEntryCreateData(entries),
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
          create: toEntryCreateData(entries),
        },
      },
      include: { entries: true },
    });
  }

  return NextResponse.json(log, { status: existing ? 200 : 201 });
}
