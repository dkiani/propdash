import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { syncAccount } from "@/lib/tradovate/sync";

export async function POST(
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

    await syncAccount(accountId);

    // Return updated account
    const updated = await prisma.propAccount.findUnique({
      where: { id: accountId },
      include: { plan: true },
    });

    return NextResponse.json({
      success: true,
      account: updated,
    });
  } catch (error) {
    console.error("Error syncing account:", error);
    return NextResponse.json(
      { error: "Sync failed. Please try again." },
      { status: 500 }
    );
  }
}
