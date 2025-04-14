-- CreateTable
CREATE TABLE "Uploader" (
  "id" TEXT NOT NULL,
  "steam_id" TEXT,
  "name" TEXT,
  "profile_url" TEXT,
  "avatar" TEXT,
  
  CONSTRAINT "Uploader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplayGroup" (
  "id" TEXT NOT NULL,
  "ballchasing_id" TEXT NOT NULL,
  "name" TEXT,
  "link" TEXT,
  
  CONSTRAINT "ReplayGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
  "id" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "name" TEXT,
  
  -- Stats
  "possession_time" DOUBLE PRECISION,
  "time_in_side" DOUBLE PRECISION,
  
  -- Core stats
  "shots" INTEGER,
  "shots_against" INTEGER,
  "goals" INTEGER,
  "goals_against" INTEGER,
  "saves" INTEGER,
  "assists" INTEGER,
  "score" INTEGER,
  "shooting_percentage" DOUBLE PRECISION,
  
  -- Team boost stats
  "boost_bpm" DOUBLE PRECISION,
  "boost_bcpm" DOUBLE PRECISION,
  "boost_avg_amount" DOUBLE PRECISION,
  "boost_amount_collected" INTEGER,
  "boost_amount_stolen" INTEGER,
  "boost_amount_collected_big" INTEGER,
  "boost_amount_stolen_big" INTEGER,
  "boost_amount_collected_small" INTEGER,
  "boost_amount_stolen_small" INTEGER,
  "boost_count_collected_big" INTEGER,
  "boost_count_stolen_big" INTEGER,
  "boost_count_collected_small" INTEGER,
  "boost_count_stolen_small" INTEGER,
  "boost_amount_overfill" INTEGER,
  "boost_amount_overfill_stolen" INTEGER,
  "boost_amount_used_while_supersonic" INTEGER,
  "boost_time_zero_boost" DOUBLE PRECISION,
  "boost_time_full_boost" DOUBLE PRECISION,
  "boost_time_boost_0_25" DOUBLE PRECISION,
  "boost_time_boost_25_50" DOUBLE PRECISION,
  "boost_time_boost_50_75" DOUBLE PRECISION,
  "boost_time_boost_75_100" DOUBLE PRECISION,
  
  -- Team movement stats
  "movement_total_distance" INTEGER,
  "movement_time_supersonic_speed" DOUBLE PRECISION,
  "movement_time_boost_speed" DOUBLE PRECISION,
  "movement_time_slow_speed" DOUBLE PRECISION,
  "movement_time_ground" DOUBLE PRECISION,
  "movement_time_low_air" DOUBLE PRECISION,
  "movement_time_high_air" DOUBLE PRECISION,
  "movement_time_powerslide" DOUBLE PRECISION,
  "movement_count_powerslide" INTEGER,
  
  -- Team positioning stats
  "positioning_time_defensive_third" DOUBLE PRECISION,
  "positioning_time_neutral_third" DOUBLE PRECISION,
  "positioning_time_offensive_third" DOUBLE PRECISION,
  "positioning_time_defensive_half" DOUBLE PRECISION,
  "positioning_time_offensive_half" DOUBLE PRECISION,
  "positioning_time_behind_ball" DOUBLE PRECISION,
  "positioning_time_infront_ball" DOUBLE PRECISION,
  
  -- Team demo stats
  "demo_inflicted" INTEGER,
  "demo_taken" INTEGER,
  
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camera" (
  "id" TEXT NOT NULL,
  "fov" DOUBLE PRECISION NOT NULL,
  "height" DOUBLE PRECISION NOT NULL,
  "pitch" DOUBLE PRECISION NOT NULL,
  "distance" DOUBLE PRECISION NOT NULL,
  "stiffness" DOUBLE PRECISION NOT NULL,
  "swivel_speed" DOUBLE PRECISION NOT NULL,
  "transition_speed" DOUBLE PRECISION NOT NULL,
  
  CONSTRAINT "Camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
  "id" TEXT NOT NULL,
  "platform" TEXT,
  "platform_id" TEXT,
  "name" TEXT NOT NULL,
  "start_time" DOUBLE PRECISION NOT NULL,
  "end_time" DOUBLE PRECISION NOT NULL,
  "car_id" INTEGER,
  "car_name" TEXT,
  "steering_sensitivity" DOUBLE PRECISION,
  "mvp" BOOLEAN DEFAULT false,
  
  -- Relations
  "teamId" TEXT NOT NULL,
  "cameraId" TEXT,
  
  -- Player core stats
  "core_shots" INTEGER,
  "core_shots_against" INTEGER,
  "core_goals" INTEGER,
  "core_goals_against" INTEGER,
  "core_saves" INTEGER,
  "core_assists" INTEGER,
  "core_score" INTEGER,
  "core_shooting_percentage" DOUBLE PRECISION,
  
  -- Player boost stats
  "boost_bpm" DOUBLE PRECISION,
  "boost_bcpm" DOUBLE PRECISION,
  "boost_avg_amount" DOUBLE PRECISION,
  "boost_amount_collected" INTEGER,
  "boost_amount_stolen" INTEGER,
  "boost_amount_collected_big" INTEGER,
  "boost_amount_stolen_big" INTEGER,
  "boost_amount_collected_small" INTEGER,
  "boost_amount_stolen_small" INTEGER,
  "boost_count_collected_big" INTEGER,
  "boost_count_stolen_big" INTEGER,
  "boost_count_collected_small" INTEGER,
  "boost_count_stolen_small" INTEGER,
  "boost_amount_overfill" INTEGER,
  "boost_amount_overfill_stolen" INTEGER,
  "boost_amount_used_while_supersonic" INTEGER,
  "boost_time_zero_boost" DOUBLE PRECISION,
  "boost_percent_zero_boost" DOUBLE PRECISION,
  "boost_time_full_boost" DOUBLE PRECISION,
  "boost_percent_full_boost" DOUBLE PRECISION,
  "boost_time_boost_0_25" DOUBLE PRECISION,
  "boost_time_boost_25_50" DOUBLE PRECISION,
  "boost_time_boost_50_75" DOUBLE PRECISION,
  "boost_time_boost_75_100" DOUBLE PRECISION,
  "boost_percent_boost_0_25" DOUBLE PRECISION,
  "boost_percent_boost_25_50" DOUBLE PRECISION,
  "boost_percent_boost_50_75" DOUBLE PRECISION,
  "boost_percent_boost_75_100" DOUBLE PRECISION,
  
  -- Player movement stats
  "movement_avg_speed" DOUBLE PRECISION,
  "movement_total_distance" INTEGER,
  "movement_time_supersonic_speed" DOUBLE PRECISION,
  "movement_time_boost_speed" DOUBLE PRECISION,
  "movement_time_slow_speed" DOUBLE PRECISION,
  "movement_time_ground" DOUBLE PRECISION,
  "movement_time_low_air" DOUBLE PRECISION,
  "movement_time_high_air" DOUBLE PRECISION,
  "movement_time_powerslide" DOUBLE PRECISION,
  "movement_count_powerslide" INTEGER,
  "movement_avg_powerslide_duration" DOUBLE PRECISION,
  "movement_avg_speed_percentage" DOUBLE PRECISION,
  "movement_percent_slow_speed" DOUBLE PRECISION,
  "movement_percent_boost_speed" DOUBLE PRECISION,
  "movement_percent_supersonic_speed" DOUBLE PRECISION,
  "movement_percent_ground" DOUBLE PRECISION,
  "movement_percent_low_air" DOUBLE PRECISION,
  "movement_percent_high_air" DOUBLE PRECISION,
  
  -- Player positioning stats
  "positioning_avg_distance_to_ball" DOUBLE PRECISION,
  "positioning_avg_distance_to_ball_possession" DOUBLE PRECISION,
  "positioning_avg_distance_to_ball_no_possession" DOUBLE PRECISION,
  "positioning_avg_distance_to_mates" DOUBLE PRECISION,
  "positioning_time_defensive_third" DOUBLE PRECISION,
  "positioning_time_neutral_third" DOUBLE PRECISION,
  "positioning_time_offensive_third" DOUBLE PRECISION,
  "positioning_time_defensive_half" DOUBLE PRECISION,
  "positioning_time_offensive_half" DOUBLE PRECISION,
  "positioning_time_behind_ball" DOUBLE PRECISION,
  "positioning_time_infront_ball" DOUBLE PRECISION,
  "positioning_time_most_back" DOUBLE PRECISION,
  "positioning_time_most_forward" DOUBLE PRECISION,
  "positioning_time_closest_to_ball" DOUBLE PRECISION,
  "positioning_time_farthest_from_ball" DOUBLE PRECISION,
  "positioning_percent_defensive_third" DOUBLE PRECISION,
  "positioning_percent_offensive_third" DOUBLE PRECISION,
  "positioning_percent_neutral_third" DOUBLE PRECISION,
  "positioning_percent_defensive_half" DOUBLE PRECISION,
  "positioning_percent_offensive_half" DOUBLE PRECISION,
  "positioning_percent_behind_ball" DOUBLE PRECISION,
  "positioning_percent_infront_ball" DOUBLE PRECISION,
  "positioning_percent_most_back" DOUBLE PRECISION,
  "positioning_percent_most_forward" DOUBLE PRECISION,
  "positioning_percent_closest_to_ball" DOUBLE PRECISION,
  "positioning_percent_farthest_from_ball" DOUBLE PRECISION,
  "positioning_goals_against_while_last_defender" INTEGER,
  
  -- Player demo stats
  "demo_inflicted" INTEGER,
  "demo_taken" INTEGER,
  
  CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add new columns to Replay table
ALTER TABLE "Replay" 
  ADD COLUMN "rocket_league_id" TEXT,
  ADD COLUMN "match_guid" TEXT,
  ADD COLUMN "title" TEXT,
  ADD COLUMN "map_code" TEXT,
  ADD COLUMN "map_name" TEXT,
  ADD COLUMN "match_type" TEXT,
  ADD COLUMN "team_size" INTEGER,
  ADD COLUMN "playlist_id" TEXT,
  ADD COLUMN "playlist_name" TEXT,
  ADD COLUMN "duration" INTEGER,
  ADD COLUMN "overtime" BOOLEAN DEFAULT false,
  ADD COLUMN "overtime_seconds" INTEGER,
  ADD COLUMN "season" INTEGER,
  ADD COLUMN "season_type" TEXT,
  ADD COLUMN "date" TIMESTAMP(3),
  ADD COLUMN "date_has_timezone" BOOLEAN,
  ADD COLUMN "visibility" TEXT,
  ADD COLUMN "link" TEXT,
  ADD COLUMN "uploaderId" TEXT,
  ADD COLUMN "blueTeamId" TEXT,
  ADD COLUMN "orangeTeamId" TEXT;

-- CreateTable
CREATE TABLE "_ReplayToReplayGroup" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ReplayGroup_ballchasing_id_key" ON "ReplayGroup"("ballchasing_id");

-- CreateIndex
CREATE UNIQUE INDEX "_ReplayToReplayGroup_AB_unique" ON "_ReplayToReplayGroup"("A", "B");
CREATE INDEX "_ReplayToReplayGroup_B_index" ON "_ReplayToReplayGroup"("B");

-- AddForeignKey
ALTER TABLE "Replay" ADD CONSTRAINT "Replay_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "Uploader"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Replay" ADD CONSTRAINT "Replay_blueTeamId_fkey" FOREIGN KEY ("blueTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Replay" ADD CONSTRAINT "Replay_orangeTeamId_fkey" FOREIGN KEY ("orangeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Player" ADD CONSTRAINT "Player_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReplayToReplayGroup" ADD CONSTRAINT "_ReplayToReplayGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Replay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ReplayToReplayGroup" ADD CONSTRAINT "_ReplayToReplayGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "ReplayGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE; 