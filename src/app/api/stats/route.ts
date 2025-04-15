import { getAllStats } from "@/lib/stats";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const stats = await getAllStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
