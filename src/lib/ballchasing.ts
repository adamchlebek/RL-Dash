import axios from "axios";
import FormData from "form-data";
import { BallchasingStatus, BallchasingReplayResponse } from "@/types";
import { ballchasingRateLimiter } from "./ratelimit";

const API_KEY = process.env.BALLCHASING_API_KEY;
const BASE_URL = "https://ballchasing.com/api";

// Add debug mode flag to enable/disable verbose logging
const DEBUG_MODE = process.env.NODE_ENV !== "production";

export interface ReplayResponse {
  id: string;
  status: BallchasingStatus;
  created?: string;
  link?: string;
  location?: string;
  isDuplicate?: boolean;
}

export const uploadReplay = async (
  file: Buffer,
  fileName: string,
): Promise<ReplayResponse> => {
  const formData = new FormData();
  formData.append("file", file, {
    filename: fileName,
    contentType: "application/octet-stream",
  });

  try {
    if (DEBUG_MODE)
      console.log(`[Ballchasing API] Queuing upload for ${fileName}...`);

    // Use rate limiter for the upload request
    const response = await ballchasingRateLimiter.executeWithRateLimit(
      "upload", // Using 'upload' as identifier for upload requests
      async () => {
        if (DEBUG_MODE)
          console.log(`[Ballchasing API] Executing upload for ${fileName}...`);
        return await axios.post(`${BASE_URL}/v2/upload`, formData, {
          headers: {
            Authorization: API_KEY,
            ...formData.getHeaders(),
          },
        });
      },
    );

    console.log("Upload successful, Ballchasing ID:", response.data.id);

    return {
      id: response.data.id,
      status: "pending",
      created: response.data.created,
      link: response.data.location,
      location: response.data.location,
      isDuplicate: false,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      // 409 means duplicate replay - this is actually a success case
      // according to the API docs
      console.log(
        "Duplicate replay detected, using existing replay ID:",
        error.response.data.id,
      );
      return {
        id: error.response.data.id,
        status: "pending",
        link: error.response.data.location,
        location: error.response.data.location,
        isDuplicate: true,
      };
    }

    // Re-throw any other errors
    console.error(
      "Error uploading to Ballchasing:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw error;
  }
};

/**
 * Checks the status of a replay on Ballchasing.
 *
 * Status mapping:
 * - If we can fetch replay details successfully with status 'ok' => 'ok' (processed successfully)
 * - If status is 'pending' or 404 error => 'pending' (still being processed by Ballchasing)
 * - Any other error => 'failed'
 */
export const checkReplayStatus = async (
  replayId: string,
): Promise<BallchasingStatus> => {
  try {
    if (DEBUG_MODE)
      console.log(
        `[Ballchasing API] Queuing status check for replay: ${replayId}`,
      );

    // Use rate limiter for the status check request
    const response = await ballchasingRateLimiter.executeWithRateLimit(
      replayId,
      async () => {
        if (DEBUG_MODE)
          console.log(
            `[Ballchasing API] Executing status check for replay: ${replayId}`,
          );
        return await axios.get(`${BASE_URL}/replays/${replayId}`, {
          headers: {
            Authorization: API_KEY,
          },
        });
      },
    );

    // Check the actual status from the response
    if (response.data && response.data.status) {
      const ballchasingStatus = response.data.status;
      console.log(`Replay ${replayId} has status: ${ballchasingStatus}`);

      if (ballchasingStatus === "pending") {
        return "pending";
      } else if (ballchasingStatus === "ok") {
        return "ok";
      } else {
        // Handle any unexpected status
        console.log(`Unexpected status from Ballchasing: ${ballchasingStatus}`);
        return "failed";
      }
    }

    // If we can fetch the replay details but no status field, assume it's processed successfully
    console.log(`Replay ${replayId} is processed (ok)`);
    return "ok";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        // The replay exists but is still processing
        console.log(`Replay ${replayId} is still pending`);
        return "pending";
      } else if (error.response?.status === 401) {
        console.error("Authentication error: Check your API key");
      } else if (error.response?.status === 429) {
        console.error("Rate limit exceeded for Ballchasing API");
      }
      console.error(`Replay ${replayId} check failed:`, error.message);
    } else {
      console.error(
        `Replay ${replayId} check failed:`,
        error instanceof Error ? error.message : "Unknown error",
      );
    }
    return "failed";
  }
};

/**
 * Fetches the full replay data from Ballchasing API
 */
export const fetchFullReplayData = async (
  ballchasingId: string,
): Promise<BallchasingReplayResponse> => {
  try {
    if (!API_KEY) {
      throw new Error("Ballchasing API key not found");
    }

    if (DEBUG_MODE)
      console.log(
        `[Ballchasing API] Queuing full data fetch for replay: ${ballchasingId}`,
      );

    // Use rate limiter for fetching full replay data
    const response = await ballchasingRateLimiter.executeWithRateLimit(
      ballchasingId,
      async () => {
        if (DEBUG_MODE)
          console.log(
            `[Ballchasing API] Executing full data fetch for replay: ${ballchasingId}`,
          );
        return await axios.get(`${BASE_URL}/replays/${ballchasingId}`, {
          headers: {
            Authorization: API_KEY,
          },
        });
      },
    );

    if (response.status !== 200) {
      throw new Error(`Failed to fetch replay data: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error(
      `Error fetching full replay data for ${ballchasingId}:`,
      error,
    );
    throw error;
  }
};
