import { NextRequest, NextResponse } from "next/server";
import { checkReplayStatus, fetchFullReplayData } from "@/lib/ballchasing";
import { prisma, checkDatabaseConnection } from "@/lib/prisma";
import type { ReplayStatus } from "@/types";
import { createOrUpdateTeam } from "@/lib/teams";

// Define proper types instead of using any
interface PlayerIdData {
  platform: string;
  id: string;
}

interface CameraSettings {
  fov: number;
  height: number;
  pitch: number;
  distance: number;
  stiffness: number;
  swivel_speed: number;
  transition_speed: number;
}

interface PlayerStats {
  core?: Record<string, number>;
  boost?: Record<string, number>;
  movement?: Record<string, number>;
  positioning?: Record<string, number>;
  demo?: Record<string, number>;
}

interface PlayerData {
  id?: PlayerIdData;
  name?: string;
  car_name?: string;
  car_id?: number;
  start_time?: number;
  end_time?: number;
  steering_sensitivity?: number;
  mvp?: boolean;
  camera?: CameraSettings;
  stats?: PlayerStats;
}

interface TeamStats {
  core?: Record<string, number>;
  boost?: Record<string, number>;
  movement?: Record<string, number>;
  positioning?: Record<string, number>;
  demo?: Record<string, number>;
  ball?: Record<string, number>;
}

interface TeamData {
  name?: string;
  players?: PlayerData[];
  stats?: TeamStats;
}

interface GroupData {
  id: string;
  name?: string;
  link?: string;
}

interface UploaderData {
  steam_id: string;
  name: string;
  profile_url?: string;
  avatar?: string;
}

async function createOrUpdateUploader(uploaderData: UploaderData) {
  if (!uploaderData) return null;

  try {
    // Check if uploader already exists by steamId
    const existingUploader = await prisma.uploader.findFirst({
      where: { steamId: uploaderData.steam_id },
    });

    if (existingUploader) {
      // Update existing uploader
      return await prisma.uploader.update({
        where: { id: existingUploader.id },
        data: {
          name: uploaderData.name || existingUploader.name,
          profileUrl: uploaderData.profile_url || existingUploader.profileUrl,
          avatar: uploaderData.avatar || existingUploader.avatar,
        },
      });
    } else {
      // Create new uploader
      return await prisma.uploader.create({
        data: {
          steamId: uploaderData.steam_id,
          name: uploaderData.name,
          profileUrl: uploaderData.profile_url,
          avatar: uploaderData.avatar,
        },
      });
    }
  } catch (error) {
    console.error("Error creating/updating uploader:", error);
    return null;
  }
}

async function createOrUpdateGroup(groupData: GroupData) {
  if (!groupData) return null;

  try {
    // Check if group already exists by ballchasingId
    const existingGroup = await prisma.replayGroup.findUnique({
      where: { ballchasingId: groupData.id },
    });

    if (existingGroup) {
      // Group already exists, return it
      return existingGroup;
    } else {
      // Create new group
      return await prisma.replayGroup.create({
        data: {
          ballchasingId: groupData.id,
          name: groupData.name || groupData.id, // Ensure name is always a string
          link: groupData.link,
        },
      });
    }
  } catch (error) {
    console.error("Error creating/updating group:", error);
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Extract the URL and parameters
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const replayId = pathParts[pathParts.length - 2]; // Extract ID from URL path
  const ballchasingId = url.searchParams.get("ballchasingId"); // Get ballchasingId from query

  if (!replayId && !ballchasingId) {
    return NextResponse.json(
      { error: "No replay ID or ballchasingId provided" },
      { status: 400 },
    );
  }

  try {
    // Check database connection
    const isDbConnected = await checkDatabaseConnection();

    // If database is not accessible but we have ballchasingId, use that
    if (!isDbConnected) {
      if (!ballchasingId) {
        return NextResponse.json(
          { error: "Database unavailable and no ballchasingId provided" },
          { status: 400 },
        );
      }

      const status = await checkReplayStatus(ballchasingId);
      return NextResponse.json({
        status:
          status === "ok"
            ? "completed"
            : status === "pending"
              ? "processing"
              : status,
      });
    }

    // Database is available, check if the replay exists
    const replay = await prisma.replay.findUnique({
      where: { id: replayId },
    });

    if (!replay) {
      return NextResponse.json({ error: "Replay not found" }, { status: 404 });
    }

    // If status is already final, return it
    if (replay.status === "completed" || replay.status === "failed") {
      return NextResponse.json({ status: replay.status });
    }

    // Check with Ballchasing API - now using the rate limited version
    let status: ReplayStatus;
    try {
      const ballchasingStatus = await checkReplayStatus(replay.ballchasingId);
      status =
        ballchasingStatus === "ok"
          ? "completed"
          : ballchasingStatus === "pending"
            ? "processing"
            : "failed";
    } catch (error) {
      // If rate limited, keep as processing
      if (error instanceof Error && error.message.includes("429")) {
        console.warn(
          `Rate limit hit for replay ${replayId}, keeping as processing`,
        );
        return NextResponse.json({
          status: "processing",
          message: "Rate limit exceeded, will retry later",
        });
      }
      throw error; // Re-throw other errors
    }

    if (status === "completed") {
      try {
        // Fetch the complete replay data from Ballchasing API - now using the rate limited version
        const fullReplayData = await fetchFullReplayData(replay.ballchasingId);

        // Create teams, players, cameras, and uploader if they don't exist
        // Process Blue Team
        const blueTeam = await createOrUpdateTeam(
          fullReplayData.blue as TeamData,
          "blue",
          false,
          undefined,
        );

        // Process Orange Team
        const orangeTeam = await createOrUpdateTeam(
          fullReplayData.orange as TeamData,
          "orange",
          false,
          undefined,
        );

        // Process Uploader
        const uploader = await createOrUpdateUploader(fullReplayData.uploader);

        // Process Groups
        const groups = await Promise.all(
          (fullReplayData.groups || []).map(async (group) => {
            return await createOrUpdateGroup(group);
          }),
        );

        // Update the replay with all of the data and relationships
        await prisma.replay.update({
          where: { id: replayId },
          data: {
            status: "completed",
            processedAt: new Date(),
            // Extract relevant fields from the full data
            rocketLeagueId: fullReplayData.rocket_league_id,
            matchGuid: fullReplayData.match_guid,
            title: fullReplayData.title,
            mapCode: fullReplayData.map_code,
            mapName: fullReplayData.map_name,
            matchType: fullReplayData.match_type,
            teamSize: fullReplayData.team_size,
            playlistId: fullReplayData.playlist_id,
            playlistName: fullReplayData.playlist_name,
            duration: fullReplayData.duration,
            overtime: fullReplayData.overtime,
            overtimeSeconds: fullReplayData.overtime_seconds,
            season: fullReplayData.season,
            seasonType: fullReplayData.season_type,
            date: new Date(fullReplayData.date),
            dateHasTimezone: fullReplayData.date_has_timezone,
            visibility: fullReplayData.visibility,
            link: fullReplayData.link,
            created: fullReplayData.created
              ? new Date(fullReplayData.created)
              : undefined,
            // Connect relationships
            uploader: uploader ? { connect: { id: uploader.id } } : undefined,
            blueTeam: blueTeam ? { connect: { id: blueTeam.id } } : undefined,
            orangeTeam: orangeTeam
              ? { connect: { id: orangeTeam.id } }
              : undefined,
            groups: {
              connect: groups
                .filter((g) => g !== null)
                .map((g) => ({ id: g!.id })),
            },
          },
        });

        return NextResponse.json({ status: "completed" });
      } catch (error) {
        console.error(`Error processing completed replay ${replayId}:`, error);

        // Check if the error is due to rate limiting
        if (error instanceof Error && error.message.includes("429")) {
          console.warn(
            `Rate limit hit during data fetch for replay ${replayId}, keeping as processing`,
          );
          return NextResponse.json({
            status: "processing",
            message: "Rate limit exceeded during data fetch, will retry later",
          });
        }

        // For other errors, still mark as completed
        await prisma.replay.update({
          where: { id: replayId },
          data: {
            status: "completed",
            processedAt: new Date(),
          },
        });

        return NextResponse.json({
          status: "completed",
          message: "Marked as completed despite processing error",
        });
      }
    } else if (status === "failed") {
      // Update to failed
      await prisma.replay.update({
        where: { id: replayId },
        data: {
          status: "failed",
          processedAt: null,
        },
      });

      return NextResponse.json({ status: "failed" });
    }

    // Still processing
    return NextResponse.json({ status: "processing" });
  } catch (error) {
    console.error("Error checking replay status:", error);
    return NextResponse.json(
      {
        error: "Failed to check replay status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
