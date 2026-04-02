import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import {
  computeTradeStats,
  computePnlByDayOfWeek,
  computePnlByHour,
} from "@/lib/analytics";
import { calculateDrawdown, calculateEvalProgress } from "@/lib/drawdown";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { accountId } = await params;

    const account = await prisma.propAccount.findFirst({
      where: { id: accountId, userId },
      include: { plan: true },
    });
    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const trades = await prisma.trade.findMany({
      where: { accountId },
      orderBy: { entryTime: "asc" },
    });

    const stats = computeTradeStats(trades);
    const pnlByDayOfWeek = computePnlByDayOfWeek(trades);
    const pnlByHour = computePnlByHour(trades);

    const drawdown = calculateDrawdown({
      drawdownType: account.plan.drawdownType as "trailing" | "eod" | "static",
      startingBalance: account.plan.startingBalance,
      maxDrawdown: account.plan.maxDrawdown,
      currentBalance: account.currentBalance,
      highWaterMark: account.highWaterMark,
    });

    let evalProgress = null;
    if (account.plan.profitTarget && account.plan.minTradingDays) {
      evalProgress = calculateEvalProgress({
        currentBalance: account.currentBalance,
        startingBalance: account.plan.startingBalance,
        profitTarget: account.plan.profitTarget,
        tradingDaysCount: account.tradingDaysCount,
        minTradingDays: account.plan.minTradingDays,
      });
    }

    return NextResponse.json({
      stats,
      pnlByDayOfWeek,
      pnlByHour,
      drawdown,
      evalProgress,
    });
  } catch (error) {
    console.error("Error computing analytics:", error);
    return NextResponse.json(
      { error: "Failed to compute analytics" },
      { status: 500 }
    );
  }
}
