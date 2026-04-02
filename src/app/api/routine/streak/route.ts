import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Fetch all routine entries ordered by date descending
    const entries = await prisma.routineEntry.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { date: "desc" },
      select: { date: true },
    });

    if (entries.length === 0) {
      return NextResponse.json({ streak: 0 });
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the most recent entry is today or yesterday
    const mostRecentDate = new Date(entries[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);

    const diffFromToday = Math.round(
      (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If the most recent entry is more than 1 day ago, streak is 0
    if (diffFromToday > 1) {
      return NextResponse.json({ streak: 0 });
    }

    // Count consecutive days backwards
    let expectedDate = new Date(mostRecentDate);

    for (const entry of entries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      const diff = Math.round(
        (expectedDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === 0) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    return NextResponse.json({ streak });
  } catch (error) {
    console.error("Error calculating streak:", error);
    return NextResponse.json(
      { error: "Failed to calculate streak" },
      { status: 500 }
    );
  }
}
