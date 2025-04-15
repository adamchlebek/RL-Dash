import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This is a simple endpoint that returns the number of replays that are still processing
export async function GET(): Promise<NextResponse> {
  try {
    const count = await prisma.replay.count({
      where: { status: "processing" },
    });

    return NextResponse.json({ processingCount: count });
  } catch (error) {
    console.error("Error checking processing replays:", error);
    return NextResponse.json(
      {
        error: "Failed to check processing replays",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
