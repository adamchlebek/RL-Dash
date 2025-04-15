import { NextResponse } from "next/server";
import { getPlayerStats } from "@/lib/stats";

export async function GET(): Promise<NextResponse> {
  try {
    const playerStats = await getPlayerStats();
    return NextResponse.json(playerStats);
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch player stats" },
      { status: 500 },
    );
  }
}
