import { useEffect } from "react";
import { supabase } from "./supabaseClient";

export const useReplaySubscription = (
  onComplete: () => Promise<void>,
): void => {
  useEffect(() => {
    const channel = supabase
      .channel("replay-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Replay",
        },
        async (payload) => {
          if (
            payload.new &&
            payload.new.status === "completed" &&
            payload.old?.status !== "completed"
          ) {
            await onComplete();
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [onComplete]);
};
