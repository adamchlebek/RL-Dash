use serde::Serialize;
use serde_json::Number;
use boxcars::{Replay, HeaderProp};
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, Serialize)]
pub enum ReplayStatus {
    ok,
    processing,
    failed,
}

#[derive(Debug, Serialize)]
pub struct PlayerId {
    pub platform: String,
    pub id: String,
}

#[derive(Debug, Serialize)]
pub struct CoreStats {
    pub shots: i32,
    pub goals: i32,
    pub saves: i32,
    pub assists: i32,
    pub score: i32,
    pub mvp: bool,
    pub shooting_percentage: f32,
}

#[derive(Debug, Serialize)]
pub struct BoostStats {
    pub bpm: f32,
}

#[derive(Debug, Serialize)]
pub struct DemoStats {
    pub inflicted: i32,
    pub taken: i32,
}

#[derive(Debug, Serialize)]
pub struct Stats {
    pub core: CoreStats,
    pub boost: BoostStats,
    pub demo: DemoStats,
}

#[derive(Debug, Serialize)]
pub struct Player {
    pub name: String,
    pub id: PlayerId,
    pub car_id: i32,
    pub car_name: String,
    pub status: Stats,
}

#[derive(Debug, Serialize)]
pub struct Team {
    pub color: String,
    pub name: String,
    pub players: Vec<Player>,
}

#[derive(Debug, Serialize)]
pub struct ReplayResponse {
    pub id: Option<String>,
    pub created: Option<String>,
    pub status: Option<ReplayStatus>,
    pub rocket_league_id: Option<String>,
    pub match_guid: Option<String>,
    pub title: Option<String>,
    pub map_code: Option<String>,
    pub team_size: Option<Number>,
    pub playlist_id: Option<String>,
    pub duration: Option<Number>,
    pub date: Option<String>,
    pub blue: Option<Team>,
    pub orange: Option<Team>,
}

pub struct ReplayWrapper<'a> {
    pub replay: &'a Replay,
}

impl<'a> ReplayWrapper<'a> {
    pub fn new(replay: &'a Replay) -> Self {
        Self { replay }
    }

    pub fn get(&self, path: &str) -> Option<String> {
        let parts: Vec<&str> = path.split('.').collect();
        match parts[0] {
            "properties" => {
                let key = parts[1];
                self.replay.properties.iter()
                    .find(|(k, _)| k == key)
                    .and_then(|(_, v)| match v {
                        HeaderProp::Str(s) => Some(s.clone()),
                        HeaderProp::Int(i) => Some(i.to_string()),
                        HeaderProp::Float(f) => Some(f.to_string()),
                        HeaderProp::Bool(b) => Some(b.to_string()),
                        HeaderProp::Name(n) => Some(n.to_string()),
                        _ => None
                    })
            },
            "header" => {
                let key = parts[1];
                match key {
                    "version" => Some(format!("{}.{}", self.replay.major_version, self.replay.minor_version)),
                    "length" => Some(self.replay.header_size.to_string()),
                    "crc" => Some(self.replay.header_crc.to_string()),
                    _ => None
                }
            },
            "network_frames" => {
                let key = parts[1];
                match key {
                    "count" => self.replay.network_frames.as_ref().map(|f| f.frames.len().to_string()),
                    _ => None
                }
            },
            _ => None
        }
    }

    pub fn build_response(&self) -> ReplayResponse {
        return {
            ReplayResponse {
                id: Some(Uuid::new_v4().to_string()),
                created: Some(Utc::now().to_rfc3339()),
                status: Some(ReplayStatus::ok),
                rocket_league_id: self.get("properties.Id"),
                match_guid: self.get("properties.MatchGuid"),
                date: self.get("properties.Date"),
                playlist_id: self.get("properties.MatchType"),
                duration: self.get("properties.TotalSecondsPlayed").and_then(|s| s.parse::<f64>().ok()).map(Number::from_f64).flatten(),
                title: self.get("properties.ReplayName"),
                map_code: self.get("properties.MapName"),
                team_size: self.get("properties.TeamSize").and_then(|s| s.parse::<f64>().ok()).map(Number::from_f64).flatten(),
                blue: None,
                orange: None,
            }
        }
    }
} 