use crate::helpers::{get_f32, get_i32, get_overtime_seconds, is_overtime};
use crate::types::ballchasing::PlayerId as BallchasingPlayerId;
use crate::types::cars::get_car_map;
use crate::types::{
    BallchasingPlayer, BallchasingReplay, BallchasingTeam, BallchasingTeamStats, BoostStats,
    CoreStats, DemoStats, PlayerStats,
};

use boxcars::{Attribute, Frame, HeaderProp, Replay};
use chrono::Utc;
use std::collections::HashMap;
use uuid::Uuid;

/// Parse the replay into a Ballchasing-style object
pub fn parse_to_ballchasing(replay: &Replay) -> BallchasingReplay {
    let props = &replay.properties;
    let frames = replay
        .network_frames
        .as_ref()
        .map(|nf| nf.frames.as_slice())
        .unwrap_or(&[]);
    let car_id_map = get_car_ids_by_name(frames);

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

    let all_players = parse_players(props, &car_id_map);

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
fn parse_players(
    props: &[(String, HeaderProp)],
    car_ids: &HashMap<String, (u32, String)>,
) -> Vec<(i32, i32, BallchasingPlayer)> {
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
                    let uid = fields
                        .iter()
                        .find(|(k, _)| k == "Uid")
                        .and_then(|(_, v)| match v {
                            HeaderProp::QWord(q) => Some(q.to_string()),
                            _ => None,
                        });

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
                        Some("OnlinePlatform_Steam") => "steam",
                        Some("OnlinePlatform_Epic") => "epic",
                        Some("OnlinePlatform_PS4") => "ps4",
                        Some("OnlinePlatform_PS5") => "ps5",
                        Some("OnlinePlatform_Xbox") => "xbox",
                        Some("OnlinePlatform_Switch") => "switch",
                        Some(other) => other,
                        None => "unknown",
                    }
                    .to_string();

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

        let (car_id, car_name) = car_ids
            .get(&name)
            .cloned()
            .unwrap_or_else(|| (0, "Unknown".to_string()));

        let player = BallchasingPlayer {
            name,
            id: BallchasingPlayerId {
                platform,
                id: platform_id,
            },
            car_id,
            car_name,
            stats: PlayerStats {
                core: CoreStats {
                    shots: shots as u32,
                    goals: goals as u32,
                    saves: saves as u32,
                    assists: assists as u32,
                    score: score as u32,
                    mvp: false,
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

/// Match car ID by player name from TeamLoadout attribute
pub fn get_car_ids_by_name(frames: &[Frame]) -> HashMap<String, (u32, String)> {
    let mut car_ids: HashMap<String, (u32, String)> = HashMap::new();
    let car_map = get_car_map();

    for frame in frames {
        for actor in &frame.updated_actors {
            if let Attribute::TeamLoadout(loadout) = &actor.attribute {
                // Try to find the corresponding name from the same actor
                let name_attr = frame.updated_actors.iter().find(|a| {
                    a.actor_id == actor.actor_id && matches!(&a.attribute, Attribute::String(_))
                });

                if let Some(Attribute::String(player_name)) = name_attr.map(|a| &a.attribute) {
                    let body_id = loadout.blue.body; // you can also choose orange if needed
                    let car_name = car_map
                        .get(&(body_id as u32))
                        .unwrap_or(&"Unknown")
                        .to_string();

                    car_ids.insert(player_name.clone(), (body_id as u32, car_name));
                }
            }
        }
    }

    car_ids
}
