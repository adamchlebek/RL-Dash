"use client";

import { useEffect, useState } from "react";
import { getEdgeConfig } from "@/lib/edgeConfig";
import { supabase } from "@/lib/supabase";

export function BackgroundPolling() {
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [pollingInterval, setPollingInterval] = useState<number>(30);

  useEffect(() => {
    const checkPollingStatus = async () => {
      try {
        const [pollingEnabled, interval] = await Promise.all([
          getEdgeConfig<boolean>("polling_enabled"),
          getEdgeConfig<number>("polling_interval"),
        ]);
        setIsPolling(pollingEnabled?.value ?? true);
        setPollingInterval(interval?.value ?? 30);
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
            setIsPolling(payload.new.value.value ?? true);
          } else if (payload.new?.key === "polling_interval") {
            setPollingInterval(payload.new.value.value ?? 30);
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
        await fetch("/api/cron/poll-replays");
      } catch (error) {
        console.error("Error polling replays:", error);
      }
    }, pollingInterval * 1000);

    return () => clearInterval(interval);
  }, [isPolling, pollingInterval]);

  return null;
}
