import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const account = await prisma.propAccount.findFirst({
      where: { id, userId },
      include: {
        plan: true,
        trades: {
          orderBy: { entryTime: "desc" },
          take: 50,
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

const updateAccountSchema = z.object({
  accountName: z.string().optional(),
  status: z.enum(["active", "inactive", "blown", "passed"]).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const body = await req.json();
    const data = updateAccountSchema.parse(body);

    // Verify ownership
    const existing = await prisma.propAccount.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const account = await prisma.propAccount.update({
      where: { id },
      data,
      include: { plan: true },
    });

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const existing = await prisma.propAccount.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    await prisma.propAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
