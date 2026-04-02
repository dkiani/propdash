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

    const accounts = await prisma.propAccount.findMany({
      where: { userId },
      select: {
        id: true,
        accountName: true,
        lastSyncAt: true,
        connection: {
          select: {
            isValid: true,
          },
        },
      },
    });

    const statuses = accounts.map((a) => ({
      id: a.id,
      accountName: a.accountName,
      lastSyncAt: a.lastSyncAt,
      isValid: a.connection.isValid,
    }));

    return NextResponse.json(statuses);
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}
