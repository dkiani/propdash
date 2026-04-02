import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { verifyTradovateCredentials } from "@/lib/tradovate/auth";

const verifySchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().min(1, "API secret is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, apiSecret } = verifySchema.parse(body);

    const result = await verifyTradovateCredentials(apiKey, apiSecret);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accounts: result.accounts,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error verifying credentials:", error);
    return NextResponse.json(
      { error: "Failed to verify credentials" },
      { status: 500 }
    );
  }
}
