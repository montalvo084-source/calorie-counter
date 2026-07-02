import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_FOODS } from "@/lib/default-foods";

export const revalidate = 0; // Disable caching for this route

export async function GET() {
  let sources = await db.foodSource.findMany({ orderBy: { sortOrder: "asc" } });

  if (sources.length === 0) {
    await db.foodSource.createMany({ data: DEFAULT_FOODS });
    sources = await db.foodSource.findMany({ orderBy: { sortOrder: "asc" } });
  } else {
    // Patch existing sources that have no protein/fiber data yet (migration from v1)
    const needsPatch = sources.every((s) => s.protein === 0 && s.fiber === 0);
    if (needsPatch) {
      for (const food of DEFAULT_FOODS) {
        await db.foodSource.updateMany({
          where: { key: food.key },
          data: { protein: food.protein, fiber: food.fiber },
        });
      }
      sources = await db.foodSource.findMany({ orderBy: { sortOrder: "asc" } });
    }

    // Patch sources that have no waterGlasses data yet (migration from v2)
    const needsWaterPatch = sources.some((s) => s.key === "oj" && s.waterGlasses === 0);
    if (needsWaterPatch) {
      for (const food of DEFAULT_FOODS) {
        if (food.waterGlasses > 0) {
          await db.foodSource.updateMany({
            where: { key: food.key },
            data: { waterGlasses: food.waterGlasses },
          });
        }
      }
      sources = await db.foodSource.findMany({ orderBy: { sortOrder: "asc" } });
    }
  }

  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const key =
    body.key ??
    body.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") +
      "_" +
      Date.now();
  const source = await db.foodSource.create({
    data: {
      key,
      label: body.label,
      calories: Number(body.calories),
      protein: body.protein != null ? Number(body.protein) : 0,
      fiber: body.fiber != null ? Number(body.fiber) : 0,
      waterGlasses: body.waterGlasses != null ? Number(body.waterGlasses) : 0,
      unit: body.unit ?? "serving",
      emoji: body.emoji ?? "🍽️",
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(source, { status: 201 });
}
