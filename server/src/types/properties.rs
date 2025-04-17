use crate::types::PlayerStat;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Properties {
    pub team_size: u8,
    pub team0_score: u8,
    pub total_seconds_played: f32,
    pub match_start_epoch: String,
    pub goals: Vec<Goal>,
    pub highlights: Vec<Highlight>,
    pub player_stats: Vec<PlayerStat>,
    pub replay_name: String,
    pub replay_version: u32,
    pub replay_last_save_version: u32,
    pub game_version: u32,
    pub build_id: u32,
    pub changelist: u32,
    pub build_version: String,
    pub reserve_megabytes: u32,
    pub record_fps: u32,
    pub keyframe_delay: u32,
    pub max_channels: u32,
    pub max_replay_size_mb: u32,
    pub id: String,
    pub match_guid: String,
    pub map_name: String,
    pub date: String,
    pub num_frames: u32,
    pub match_type: String,
}

#[derive(Debug, Serialize)]
pub struct Goal {
    pub frame: u32,
    pub player_name: String,
    pub player_team: u8,
}

#[derive(Debug, Serialize)]
pub struct Highlight {
    pub frame: u32,
    pub car_name: String,
    pub ball_name: String,
    pub goal_actor_name: String,
}
