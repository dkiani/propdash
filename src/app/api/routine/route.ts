import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const routineSchema = z.object({
  mood: z.string().min(1, "Mood is required"),
  sleep: z.string().min(1, "Sleep is required"),
  outsideStress: z.string().min(1, "Outside stress level is required"),
  journal: z.string().optional(),
  rulesCommitted: z.boolean().default(false),
  breathworkDone: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const data = routineSchema.parse(body);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await prisma.routineEntry.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        ...data,
        completedAt: new Date(),
      },
      create: {
        userId,
        date: today,
        ...data,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error saving routine:", error);
    return NextResponse.json(
      { error: "Failed to save routine entry" },
      { status: 500 }
    );
  }
}
