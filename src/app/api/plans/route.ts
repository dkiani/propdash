import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const firm = searchParams.get("firm");

    const where: any = {};
    if (firm) {
      where.firmName = { equals: firm, mode: "insensitive" };
    }

    const plans = await prisma.propFirmPlan.findMany({
      where,
      orderBy: [{ firmName: "asc" }, { startingBalance: "asc" }],
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

const createPlanSchema = z.object({
  firmName: z.string().min(1, "Firm name is required"),
  planName: z.string().min(1, "Plan name is required"),
  startingBalance: z.number().positive("Starting balance must be positive"),
  drawdownType: z.enum(["trailing", "eod", "static"]),
  maxDrawdown: z.number().positive("Max drawdown must be positive"),
  profitTarget: z.number().positive().optional(),
  minTradingDays: z.number().int().positive().optional(),
  consistencyRuleType: z.string().optional(),
  consistencyValue: z.number().optional(),
  maxDailyLoss: z.number().positive().optional(),
  maxContracts: z.number().int().positive().optional(),
  payoutThreshold: z.number().positive().optional(),
  payoutSchedule: z.string().optional(),
  minPayoutDays: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createPlanSchema.parse(body);

    // Check for duplicate
    const existing = await prisma.propFirmPlan.findUnique({
      where: {
        firmName_planName: {
          firmName: data.firmName,
          planName: data.planName,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A plan with this firm and plan name already exists" },
        { status: 409 }
      );
    }

    const plan = await prisma.propFirmPlan.create({
      data: {
        ...data,
        isCustom: true,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
