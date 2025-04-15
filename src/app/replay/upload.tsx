"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  ArrowUpCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Clock10,
  LucideAlarmClock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Replay {
  id: string;
  ballchasingId: string;
  fileName: string;
  status: string;
  uploadedAt: string;
  processedAt?: string | null;
  isDuplicate?: boolean;
}

export default function ReplayUpload(): React.ReactElement {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploads, setUploads] = useState<Replay[]>([]);
  const [recentReplays, setRecentReplays] = useState<Replay[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchRecentReplays = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // First try with Supabase
      const { data, error } = await supabase
        .from("Replay")
        .select("*")
        .order("uploadedAt", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching from Supabase:", error);
        // Fallback to our API endpoint
        const response = await fetch("/api/replays/recent?limit=10");
        if (!response.ok) {
          throw new Error("Failed to fetch recent replays");
        }
        const apiData = await response.json();

        // Check status of any processing replays
        const replaysToUpdate = apiData.replays.filter(
          (r: Replay) => r.status === "processing",
        );
        await updateReplayStatuses(replaysToUpdate);

        setRecentReplays(apiData.replays);
        return;
      }

      if (data) {
        // Check status of any processing replays
        const replaysToUpdate = data.filter(
          (r: Replay) => r.status === "processing",
        );
        await updateReplayStatuses(replaysToUpdate);

        setRecentReplays(data as Replay[]);
      }
    } catch (error) {
      console.error("Error fetching recent replays:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch recent replays on component mount
  useEffect(() => {
    fetchRecentReplays();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Replay",
        },
        () => {
          // Refresh the list when any change happens
          fetchRecentReplays();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchRecentReplays]);

  const updateReplayStatuses = async (processingReplays: Replay[]) => {
    if (processingReplays.length === 0) return;

    const updatedReplays = await Promise.all(
      processingReplays.map(async (replay) => {
        try {
          const response = await fetch(
            `/api/replays/${replay.id}/status?ballchasingId=${replay.ballchasingId}`,
          );

          if (!response.ok) {
            return replay;
          }

          const data = await response.json();
          return { ...replay, status: data.status };
        } catch (error) {
          console.error(
            `Error updating status for replay ${replay.id}:`,
            error,
          );
          return replay;
        }
      }),
    );

    // Update the local state with the latest statuses
    setRecentReplays((prev) => {
      const updatedList = [...prev];
      updatedReplays.forEach((updatedReplay) => {
        const index = updatedList.findIndex(
          (r: Replay) => r.id === updatedReplay.id,
        );
        if (index !== -1) {
          updatedList[index] = updatedReplay;
        }
      });
      return updatedList;
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setError(null);

      // Track uploaded files for status updates
      const uploadedReplays: Replay[] = [];
      const duplicates: string[] = [];

      try {
        // Upload files one by one
        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append("file", file);

          try {
            const response = await fetch("/api/replays", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error(
                `Failed to upload ${file.name}:`,
                errorData.message,
              );
              continue; // Skip to next file on error
            }

            const replay = await response.json();

            // Check if it's a duplicate
            if (replay.isDuplicate) {
              duplicates.push(file.name);
              // Don't add duplicates to the uploads list
              continue; // Skip to next file
            }

            // Regular upload - add to tracking
            uploadedReplays.push(replay);

            // Add to uploads state
            setUploads((prev) => [replay, ...prev]);
          } catch (err) {
            console.error(`Error uploading ${file.name}:`, err);
          }
        }

        // Start polling for status for all new uploads
        uploadedReplays.forEach((replay) => {
          pollReplayStatus(replay.id, replay.ballchasingId);
        });

        // Show message if there were duplicates
        if (duplicates.length > 0) {
          const pluralText =
            duplicates.length === 1 ? "file has" : "files have";
          setError(
            `${duplicates.length} ${pluralText} already been processed: ${duplicates.join(", ")}`,
          );
        }

        // Refresh the list of replays
        fetchRecentReplays();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload replays",
        );
      } finally {
        setUploading(false);
      }
    },
    [fetchRecentReplays],
  );

  const pollReplayStatus = async (
    replayId: string,
    ballchasingId: string,
  ): Promise<void> => {
    const poll = async (): Promise<void> => {
      try {
        // Include ballchasingId in query params for fallback if DB is unavailable
        const response = await fetch(
          `/api/replays/${replayId}/status?ballchasingId=${ballchasingId}`,
        );

        if (!response.ok) {
          console.error("Error polling status:", await response.text());
          return;
        }

        const data = await response.json();

        setUploads((prevUploads) =>
          prevUploads.map((upload) =>
            upload.id === replayId
              ? { ...upload, status: data.status }
              : upload,
          ),
        );

        // Update in the recent replays list too
        setRecentReplays((prevReplays) =>
          prevReplays.map((replay) =>
            replay.id === replayId
              ? { ...replay, status: data.status }
              : replay,
          ),
        );

        // Continue polling if not completed or failed
        if (data.status === "processing") {
          setTimeout(poll, 15000); // Poll every 15 seconds
        }
      } catch (error) {
        console.error("Error polling replay status:", error);
      }
    };

    // Start polling
    poll();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/octet-stream": [".replay"],
    },
    maxFiles: 10, // Allow up to 10 files at once
    disabled: uploading,
  });

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "reprocessing":
        return <LucideAlarmClock className="w-5 h-5 text-blue-500" />;
      case "duplicate":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Combine the uploaded replays with the ones from the database
  const displayReplays = [
    ...uploads,
    ...recentReplays.filter(
      (dbReplay) => !uploads.some((upload) => upload.id === dbReplay.id),
    ),
  ].slice(0, 10);

  const handleUploadSuccess = useCallback(async () => {
    setUploading(false);
    setUploads([]);
    setError(null);
    setIsRefreshing(true);
    await fetchRecentReplays();
  }, [fetchRecentReplays, setUploads, setError, setIsRefreshing]);

  // First, let's add a function to handle reprocessing a replay
  const reprocessReplay = useCallback(
    async (replayId: string, ballchasingId: string) => {
      try {
        setIsRefreshing(true);
        const response = await fetch(`/api/replays/${replayId}/reprocess`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ballchasingId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to reprocess replay");
        }

        // Update the replay's status in both lists
        setRecentReplays((prev) =>
          prev.map((replay) =>
            replay.id === replayId
              ? { ...replay, status: "processing" }
              : replay,
          ),
        );

        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === replayId
              ? { ...upload, status: "processing" }
              : upload,
          ),
        );

        // Start polling for status updates
        pollReplayStatus(replayId, ballchasingId);
      } catch (error) {
        console.error("Error reprocessing replay:", error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [pollReplayStatus],
  );

  return (
    <div className="w-full space-y-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-purple-500 bg-purple-900/20"
            : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <input {...getInputProps()} />
        <ArrowUpCircle className="w-12 h-12 mx-auto mb-3 text-zinc-500" />
        <p className="text-base mb-2">
          {isDragActive
            ? "Drop the replay files here"
            : "Drag & drop replay files here, or click to select"}
        </p>
        <p className="text-xs text-zinc-500">
          Upload up to 10 .replay files at once
        </p>
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full animate-pulse w-full"></div>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Uploading...</p>
          </div>
        )}
        {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Replays</h3>
          <button
            onClick={() => fetchRecentReplays()}
            disabled={isRefreshing}
            className="text-zinc-400 hover:text-white p-1 rounded-full disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
        ) : displayReplays.length > 0 ? (
          <div className="divide-y divide-zinc-700">
            {displayReplays.map((replay) => (
              <div
                key={replay.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(replay.status)}
                  <div>
                    <p className="font-medium text-sm">{replay.fileName}</p>
                    <p className="text-xs text-zinc-500">
                      {(() => {
                        // Check if date is valid
                        const date = new Date(replay.uploadedAt);
                        return isNaN(date.getTime())
                          ? new Date().toLocaleString() // Use current date if invalid
                          : date.toLocaleString();
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-xs">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        replay.status === "completed"
                          ? "bg-green-900/50 text-green-400"
                          : replay.status === "failed"
                            ? "bg-red-900/50 text-red-400"
                            : "bg-yellow-900/50 text-yellow-400"
                      }`}
                    >
                      {replay.status}
                    </span>
                  </div>
                  {replay.status === "completed" && (
                    <button
                      onClick={() =>
                        reprocessReplay(replay.id, replay.ballchasingId)
                      }
                      disabled={isRefreshing}
                      className="flex items-center justify-center px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-zinc-500">
            No replays uploaded yet
          </p>
        )}
      </div>
    </div>
  );
}
