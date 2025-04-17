use serde::Serialize;
use super::common::*;

#[derive(Debug, Serialize)]
pub struct PlayerStat {
    pub player_id: PlayerId,
    pub name: String,
    pub platform: PlatformValue,
    pub online_id: String,
    pub team: u8,
    pub score: i32,
    pub goals: i32,
    pub assists: i32,
    pub saves: i32,
    pub shots: i32,
    pub b_bot: bool,
}

#[derive(Debug, Serialize)]
pub struct PlayerId {
    pub name: String,
    pub fields: PlayerFields,
}

#[derive(Debug, Serialize)]
pub struct PlayerFields {
    pub uid: String,
    pub np_id: NpId,
    pub epic_account_id: String,
    pub platform: Platform,
}

#[derive(Debug, Serialize)]
pub struct NpId {
    pub name: String,
    pub fields: NpFields,
}

#[derive(Debug, Serialize)]
pub struct NpFields {
    pub handle: Handle,
    pub opt: String,
    pub reserved: String,
}

#[derive(Debug, Serialize)]
pub struct Handle {
    pub name: String,
    pub fields: HandleFields,
}

#[derive(Debug, Serialize)]
pub struct HandleFields {
    pub data: String,
}

#[derive(Debug, Serialize)]
pub struct Platform {
    pub kind: String,
    pub value: String,
}

#[derive(Debug, Serialize)]
pub struct PlatformValue {
    pub kind: String,
    pub value: String,
}
