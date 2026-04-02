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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await prisma.routineEntry.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ completed: false, entry: null });
    }

    return NextResponse.json({ completed: true, entry });
  } catch (error) {
    console.error("Error fetching today's routine:", error);
    return NextResponse.json(
      { error: "Failed to fetch routine entry" },
      { status: 500 }
    );
  }
}
