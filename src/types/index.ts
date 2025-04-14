export type ReplayStatus = 'processing' | 'completed' | 'failed';

// This represents the internal application status for replays
export interface Replay {
  id: string;
  ballchasingId: string;
  fileName: string;
  status: string;
  uploadedAt: Date;
  processedAt?: Date | null;
  
  // Added data fields
  rocketLeagueId?: string | null;
  matchGuid?: string | null;
  title?: string | null;
  mapCode?: string | null;
  mapName?: string | null;
  matchType?: string | null;
  teamSize?: number | null;
  playlistId?: string | null;
  playlistName?: string | null;
  duration?: number | null;
  overtime?: boolean | null;
  overtimeSeconds?: number | null;
  season?: number | null;
  seasonType?: string | null;
  date?: Date | null;
  dateHasTimezone?: boolean | null;
  visibility?: string | null;
  link?: string | null;
  
  // Relations
  uploaderId?: string | null;
  blueTeamId?: string | null;
  orangeTeamId?: string | null;
}

// This represents the status values from the Ballchasing API
export type BallchasingStatus = 'pending' | 'ok' | 'failed';

export interface Team {
  id: string;
  color: string;
  name?: string | null;
  
  // Core stats
  possessionTime?: number | null;
  timeInSide?: number | null;
  shots?: number | null;
  shotsAgainst?: number | null;
  goals?: number | null;
  goalsAgainst?: number | null;
  saves?: number | null;
  assists?: number | null;
  score?: number | null;
  shootingPercentage?: number | null;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  platform?: string | null;
  platformId?: string | null;
  startTime: number;
  endTime: number;
  carId?: number | null;
  carName?: string | null;
  steeringSensitivity?: number | null;
  mvp?: boolean | null;
  
  // Core stats
  coreShots?: number | null;
  coreGoals?: number | null;
  coreSaves?: number | null;
  coreAssists?: number | null;
  coreScore?: number | null;
}

export interface BallchasingReplayResponse {
  id: string;
  link: string;
  rocket_league_id: string;
  match_guid: string;
  title: string;
  map_code: string;
  map_name: string;
  match_type: string;
  team_size: number;
  playlist_id: string;
  playlist_name: string;
  duration: number;
  overtime: boolean;
  overtime_seconds: number;
  season: number;
  season_type: string;
  date: string;
  date_has_timezone: boolean;
  visibility: string;
  
  blue: {
    name?: string;
    players: any[];
    stats: any;
  };
  
  orange: {
    name?: string;
    players: any[];
    stats: any;
  };
  
  uploader: {
    steam_id: string;
    name: string;
    profile_url?: string;
    avatar?: string;
  };
  
  groups?: {
    id: string;
    name?: string;
    link?: string;
  }[];
} 