"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function RealtimeInitializer(): null {
  useEffect(() => {
    (async () => {
      try {
        // Call the API to establish connection
        await fetch("/api/supabase/realtime", {
          method: "POST",
        });

        // Initialize realtime subscription
        supabase
          .channel("table-db-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "Replay",
            },
            (payload) => {
              console.log("Realtime change:", payload);
              // Handle any realtime changes here if needed
            },
          )
          .subscribe();
      } catch (error) {
        console.error("Failed to initialize realtime:", error);
      }
    })();
  }, []);

  // This component doesn't render anything
  return null;
}

export const fetchProcessingCount = async (): Promise<number> => {
  try {
    const response = await fetch("/api/replays/poll");
    const data = await response.json();
    return data.processingCount || 0;
  } catch (error) {
    console.error("Error fetching processing count:", error);
    return 0;
  }
};
