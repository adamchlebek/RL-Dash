use crate::helpers::{get_f32, get_i32, get_overtime_seconds, is_overtime};
use crate::types::ballchasing::PlayerId as BallchasingPlayerId;
use crate::types::{
    BallchasingPlayer, BallchasingReplay, BallchasingTeam, BallchasingTeamStats, BoostStats,
    CoreStats, DemoStats, PlayerStats,
};

use boxcars::{HeaderProp, Replay};
use chrono::Utc;
use uuid::Uuid;

/// Parse the replay into a Ballchasing-style object
pub fn parse_to_ballchasing(replay: &Replay) -> BallchasingReplay {
    let props = &replay.properties;

    let get = |key: &str| {
        props
            .iter()
            .find(|(k, _)| k == key)
            .and_then(|(_, v)| v.as_string())
            .unwrap_or("")
    };

    let id = Uuid::new_v4().to_string();
    let created = Utc::now().to_rfc3339();

    let duration = get_f32(props, "TotalSecondsPlayed") as f64;
    let overtime = is_overtime(props);
    let overtime_seconds = get_overtime_seconds(duration, overtime);

    let all_players = parse_players(props);

    BallchasingReplay {
        id,
        created,
        status: "ok".into(),
        rocket_league_id: get("Id").into(),
        match_guid: get("MatchGuid").into(),
        title: get("ReplayName").into(),
        map_code: get("MapName").into(),
        match_type: get("MatchType").into(),
        team_size: get_i32(props, "TeamSize") as u8,
        playlist_id: get("MatchType").into(),
        duration,
        overtime,
        overtime_seconds,
        date: get("Date").into(),
        blue: build_team("blue", all_players.as_slice(), 0),
        orange: build_team("orange", all_players.as_slice(), 1),
        playlist_name: get("MatchType").into(),
        map_name: get("MapName").into(),
    }
}

/// Parse all players from PlayerStats and mark global MVP
fn parse_players(props: &[(String, HeaderProp)]) -> Vec<(i32, i32, BallchasingPlayer)> {
    let binding = vec![];
    let players_raw = props
        .iter()
        .find(|(k, _)| k == "PlayerStats")
        .and_then(|(_, v)| v.as_array())
        .unwrap_or(&binding);

    let mut players: Vec<(i32, i32, BallchasingPlayer)> = vec![];

    for player in players_raw {
        let get = |key: &str| player.iter().find(|(k, _)| k == key).map(|(_, v)| v);

        let team = get("Team").and_then(|v| v.as_i32()).unwrap_or(-1);
        let name = get("Name")
            .and_then(|v| v.as_string())
            .unwrap_or("Unknown")
            .to_string();
        let (platform, platform_id) = get("PlayerID")
            .and_then(|v| match v {
                HeaderProp::Struct { fields, .. } => {
                    // Extract UID (QWord)
                    let uid = fields
                        .iter()
                        .find(|(k, _)| k == "Uid")
                        .and_then(|(_, v)| match v {
                            HeaderProp::QWord(q) => Some(q.to_string()),
                            _ => None,
                        });

                    // Extract Platform (Byte with string value)
                    let platform_raw =
                        fields
                            .iter()
                            .find(|(k, _)| k == "Platform")
                            .and_then(|(_, v)| match v {
                                HeaderProp::Byte {
                                    value: Some(val), ..
                                } => Some(val.clone()),
                                _ => None,
                            });

                    let platform = match platform_raw.as_deref() {
                        Some("OnlinePlatform_Steam") => "steam".to_string(),
                        Some("OnlinePlatform_Epic") => "epic".to_string(),
                        Some("OnlinePlatform_PS4") => "ps4".to_string(),
                        Some("OnlinePlatform_PS5") => "ps5".to_string(),
                        Some("OnlinePlatform_Xbox") => "xbox".to_string(),
                        Some("OnlinePlatform_Switch") => "switch".to_string(),
                        Some(p) => p.to_string(),
                        None => "unknown".to_string(),
                    };

                    Some((platform, uid.unwrap_or_else(|| "unknown".to_string())))
                }
                _ => None,
            })
            .unwrap_or_else(|| ("unknown".to_string(), "unknown".to_string()));

        let score = get("Score").and_then(|v| v.as_i32()).unwrap_or(0);
        let goals = get("Goals").and_then(|v| v.as_i32()).unwrap_or(0);
        let shots = get("Shots").and_then(|v| v.as_i32()).unwrap_or(0);
        let assists = get("Assists").and_then(|v| v.as_i32()).unwrap_or(0);
        let saves = get("Saves").and_then(|v| v.as_i32()).unwrap_or(0);

        let shooting_percentage = if shots > 0 {
            (goals as f32 / shots as f32 * 100.0).round() as u32
        } else {
            0
        };

        let player = BallchasingPlayer {
            name,
            id: BallchasingPlayerId {
                platform: platform.into(),
                id: platform_id,
            },
            car_id: 0,
            car_name: "Octane".into(),
            stats: PlayerStats {
                core: CoreStats {
                    shots: shots as u32,
                    goals: goals as u32,
                    saves: saves as u32,
                    assists: assists as u32,
                    score: score as u32,
                    mvp: false, // will update below
                    shooting_percentage,
                },
                boost: BoostStats { bpm: 0 },
                demo: DemoStats {
                    inflicted: 0,
                    taken: 0,
                },
            },
        };

        players.push((score, team, player));
    }

    // Mark the global MVP (highest score)
    if let Some(index) = players
        .iter()
        .enumerate()
        .max_by_key(|(_, (score, _, _))| *score)
        .map(|(i, _)| i)
    {
        players[index].2.stats.core.mvp = true;
    }

    players
}

/// Group players by team and return BallchasingTeam
fn build_team(
    color: &str,
    all_players: &[(i32, i32, BallchasingPlayer)],
    team_index: i32,
) -> BallchasingTeam {
    let players = all_players
        .iter()
        .filter(|(_, team, _)| *team == team_index)
        .map(|(_, _, p)| (*p).clone())
        .collect::<Vec<_>>();

    BallchasingTeam {
        color: color.into(),
        name: format!("{} team", color),
        players,
        stats: BallchasingTeamStats {
            core: CoreStats {
                shots: 0,
                goals: 0,
                saves: 0,
                assists: 0,
                score: 0,
                mvp: false,
                shooting_percentage: 0,
            },
            demo: DemoStats {
                inflicted: 0,
                taken: 0,
            },
        },
    }
}
