import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const account = await prisma.propAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const trades = await prisma.trade.findMany({
      where: {
        accountId,
        entryTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { entryTime: "desc" },
    });

    return NextResponse.json(trades);
  } catch (error) {
    console.error("Error fetching today's trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's trades" },
      { status: 500 }
    );
  }
}
