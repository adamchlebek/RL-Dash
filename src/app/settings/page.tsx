"use client";

import { Switch } from "@/components/ui/switch";
import { getEdgeConfig, setEdgeConfig } from "@/lib/edgeConfig";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PollingInterval } from "@/components/PollingInterval";

export default function SettingsPage() {
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(true);
  const [checkPrivateMatches, setCheckPrivateMatches] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [pollingData, privateMatchesData] = await Promise.all([
        getEdgeConfig("polling_enabled"),
        getEdgeConfig("check_private_matches")
      ]);
      setPollingEnabled(typeof pollingData?.value === "boolean" ? pollingData.value : true);
      setCheckPrivateMatches(typeof privateMatchesData?.value === "boolean" ? privateMatchesData.value : true);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePollingToggle = async (newValue: boolean) => {
    setIsUpdating(true);
    setPollingEnabled(newValue);

    try {
      await setEdgeConfig("polling_enabled", { value: newValue });
      toast.success(`Background polling ${newValue ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error updating settings:", error);
      setPollingEnabled(!newValue);
      toast.error("Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrivateMatchesToggle = async (newValue: boolean) => {
    setIsUpdating(true);
    setCheckPrivateMatches(newValue);

    try {
      await setEdgeConfig("check_private_matches", { value: newValue });
      toast.success(`Private match checking ${newValue ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Error updating settings:", error);
      setCheckPrivateMatches(!newValue);
      toast.error("Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
          Settings
        </h1>

        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Background Polling</h2>
              <p className="text-zinc-400 mt-1">
                Automatically check for new replay updates
              </p>
            </div>
            <div className="cursor-pointer">
              <Switch
                checked={pollingEnabled}
                onCheckedChange={handlePollingToggle}
                disabled={isLoading || isUpdating}
              />
            </div>
          </div>

          <PollingInterval />
        </div>

        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Check Private Matches</h2>
              <p className="text-zinc-400 mt-1">
                Verify if uploaded replays are from private matches
              </p>
            </div>
            <div className="cursor-pointer">
              <Switch
                checked={checkPrivateMatches}
                onCheckedChange={handlePrivateMatchesToggle}
                disabled={isLoading || isUpdating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 