import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 0; // Disable caching for this route

export async function GET() {
  const profile = await db.profile.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Me", activeCalorieGoal: 2400, inactiveCalorieGoal: 2000, proteinGoal: 150, fiberGoal: 25, waterGoal: 8 },
  });
  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const profile = await db.profile.upsert({
    where: { id: 1 },
    update: {
      name: body.name ?? undefined,
      activeCalorieGoal: body.activeCalorieGoal != null ? Number(body.activeCalorieGoal) : undefined,
      inactiveCalorieGoal: body.inactiveCalorieGoal != null ? Number(body.inactiveCalorieGoal) : undefined,
      proteinGoal: body.proteinGoal != null ? Number(body.proteinGoal) : undefined,
      fiberGoal: body.fiberGoal != null ? Number(body.fiberGoal) : undefined,
      waterGoal: body.waterGoal != null ? Number(body.waterGoal) : undefined,
    },
    create: {
      id: 1,
      name: body.name ?? "Me",
      activeCalorieGoal: body.activeCalorieGoal ?? 2400,
      inactiveCalorieGoal: body.inactiveCalorieGoal ?? 2000,
      proteinGoal: body.proteinGoal ?? 150,
      fiberGoal: body.fiberGoal ?? 25,
      waterGoal: body.waterGoal ?? 8,
    },
  });
  return NextResponse.json(profile);
}
