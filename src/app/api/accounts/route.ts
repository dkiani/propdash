import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { calculateDrawdown } from "@/lib/drawdown";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const accounts = await prisma.propAccount.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

const createAccountSchema = z.object({
  connectionId: z.string().min(1, "Connection ID is required"),
  planId: z.string().min(1, "Plan ID is required"),
  externalAccountId: z.string().min(1, "External account ID is required"),
  accountName: z.string().optional(),
  accountType: z.string().min(1, "Account type is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { connectionId, planId, externalAccountId, accountName, accountType } =
      createAccountSchema.parse(body);

    // Verify connection belongs to user
    const connection = await prisma.brokerConnection.findFirst({
      where: { id: connectionId, userId },
    });
    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Fetch the plan to compute initial drawdown
    const plan = await prisma.propFirmPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    const initialDrawdown = calculateDrawdown({
      drawdownType: plan.drawdownType as "trailing" | "eod" | "static",
      startingBalance: plan.startingBalance,
      maxDrawdown: plan.maxDrawdown,
      currentBalance: plan.startingBalance,
      highWaterMark: plan.startingBalance,
    });

    const account = await prisma.propAccount.create({
      data: {
        userId,
        connectionId,
        planId,
        externalAccountId,
        accountName,
        accountType,
        currentBalance: plan.startingBalance,
        highWaterMark: initialDrawdown.highWaterMark,
        drawdownFloor: initialDrawdown.drawdownFloor,
        drawdownRemaining: initialDrawdown.drawdownRemaining,
      },
      include: { plan: true },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
