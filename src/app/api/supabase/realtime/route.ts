import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(): Promise<NextResponse> {
  try {
    const { error } = await supabase.from("Replay").select("id").limit(1);

    if (error) {
      console.error("Supabase connection error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection established",
    });
  } catch (error) {
    console.error("Error testing Supabase connection:", error);
    return NextResponse.json(
      { error: "Failed to connect to Supabase" },
      { status: 500 },
    );
  }
}

export async function GET(): Promise<Response> {
  try {
    // Handling logic here if needed

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error setting up realtime subscription:", error);
    return new Response(
      JSON.stringify({ error: "Failed to set up realtime subscription" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
