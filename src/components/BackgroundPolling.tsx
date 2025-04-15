"use client";

import { useEffect, useState } from "react";
import { getEdgeConfig } from "@/lib/edgeConfig";
import { supabase } from "@/lib/supabase";

export function BackgroundPolling() {
  const [isPolling, setIsPolling] = useState<boolean>(true);

  useEffect(() => {
    const checkPollingStatus = async () => {
      try {
        const data = await getEdgeConfig("polling_enabled");
        setIsPolling(data?.value ?? true);
      } catch (error) {
        console.error("Error checking polling status:", error);
      }
    };

    checkPollingStatus();

    const channel = supabase
      .channel("edge-config-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "EdgeConfig",
        },
        async (payload) => {
          if (payload.new?.key === "polling_enabled") {
            setIsPolling(payload.new.value.value);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(async () => {
      try {
        await fetch("/api/poll-replays");
      } catch (error) {
        console.error("Error polling replays:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isPolling]);

  return null;
}
