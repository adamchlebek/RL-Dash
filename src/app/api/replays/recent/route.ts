import { NextRequest, NextResponse } from "next/server";
import { prisma, checkDatabaseConnection } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check database connection
    const isDbConnected = await checkDatabaseConnection();

    if (!isDbConnected) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          message: "Unable to fetch recent replays",
        },
        { status: 503 },
      );
    }

    // Determine limit from query parameters (default to 10)
    const url = new URL(request.url);
    const limitStr = url.searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : 10;

    // Fetch recent replays
    const replays = await prisma.replay.findMany({
      orderBy: {
        uploadedAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ replays });
  } catch (error) {
    console.error("Error fetching recent replays:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent replays" },
      { status: 500 },
    );
  }
}
