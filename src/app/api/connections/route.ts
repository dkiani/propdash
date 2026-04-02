import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const connections = await prisma.brokerConnection.findMany({
      where: { userId },
      select: {
        id: true,
        broker: true,
        isValid: true,
        lastSyncAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(connections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

const createConnectionSchema = z.object({
  broker: z.string().min(1, "Broker is required"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().min(1, "API secret is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await req.json();
    const { broker, apiKey, apiSecret } = createConnectionSchema.parse(body);

    const apiKeyEncrypted = encrypt(apiKey);
    const apiSecEncrypted = encrypt(apiSecret);

    const connection = await prisma.brokerConnection.create({
      data: {
        userId,
        broker,
        apiKeyEncrypted,
        apiSecEncrypted,
      },
      select: {
        id: true,
        broker: true,
        isValid: true,
        lastSyncAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating connection:", error);
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  }
}
