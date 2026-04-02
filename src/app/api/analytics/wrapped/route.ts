import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import {
  computeTradeStats,
  computePnlByDayOfWeek,
  computePnlByHour,
} from "@/lib/analytics";

function getWeekDateRange(weekStr: string): { start: Date; end: Date } {
  // Parse ISO week string like "2026-W13"
  const match = weekStr.match(/^(\d{4})-W(\d{2})$/);
  if (!match) throw new Error("Invalid week format. Use YYYY-Wnn (e.g. 2026-W13)");

  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  if (week < 1 || week > 53) throw new Error("Week number must be between 1 and 53");

  // ISO 8601: week 1 contains January 4th
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // Convert Sunday=0 to 7
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const week = searchParams.get("week");

    if (!week) {
      return NextResponse.json(
        { error: "week query parameter is required (e.g. 2026-W13)" },
        { status: 400 }
      );
    }

    let dateRange;
    try {
      dateRange = getWeekDateRange(week);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    // Get all user accounts
    const accounts = await prisma.propAccount.findMany({
      where: { userId },
      select: { id: true, accountName: true },
    });

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: "No accounts found" },
        { status: 404 }
      );
    }

    const accountIds = accounts.map((a) => a.id);

    // Fetch all trades for the week across all accounts
    const trades = await prisma.trade.findMany({
      where: {
        accountId: { in: accountIds },
        entryTime: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      orderBy: { entryTime: "asc" },
    });

    const stats = computeTradeStats(trades);
    const pnlByDayOfWeek = computePnlByDayOfWeek(trades);
    const pnlByHour = computePnlByHour(trades);

    // Per-account breakdown
    const perAccount = accounts.map((account) => {
      const accountTrades = trades.filter((t) => t.accountId === account.id);
      return {
        accountId: account.id,
        accountName: account.accountName,
        stats: computeTradeStats(accountTrades),
      };
    });

    return NextResponse.json({
      week,
      dateRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
      overall: {
        stats,
        pnlByDayOfWeek,
        pnlByHour,
      },
      perAccount,
    });
  } catch (error) {
    console.error("Error generating wrapped:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly wrapped" },
      { status: 500 }
    );
  }
}
