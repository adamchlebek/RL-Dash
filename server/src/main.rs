use axum::{
    extract::Multipart, http::StatusCode, response::IntoResponse, routing::post, serve, Json, Router,
};
use boxcars::{ParserBuilder, Replay, HeaderProp, NetworkParse};
use serde_json::{json, Number, Value};
use tokio::net::TcpListener;
use std::net::SocketAddr;
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug, serde::Serialize)]
enum ReplayStatus {
    ok,
    processing,
    failed,
}

#[derive(Debug, serde::Serialize)]
struct ReplayResponse {
    id: Option<String>,
    created: Option<String>,
    status: Option<ReplayStatus>,
    rocket_league_id: Option<String>,
    match_guid: Option<String>,
    title: Option<String>,
    map_code: Option<String>,
    team_size: Option<Number>,
    playlist_id: Option<String>,
    duration: Option<Number>,
    date: Option<String>,
}

struct ReplayWrapper<'a> {
    replay: &'a Replay,
}

impl<'a> ReplayWrapper<'a> {
    fn new(replay: &'a Replay) -> Self {
        Self { replay }
    }

    fn get(&self, path: &str) -> Option<String> {
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

    fn build_response(&self) -> ReplayResponse {
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
            }
        }
    }
}

#[tokio::main]
async fn main() {
    let app: Router = Router::new()
        .route("/parse", post(handle_parse))
        .route("/parse/basic", post(handle_basic_parse))
        .route("/output", post(|multipart| handle_output(multipart, NetworkParse::Always)))
        .route("/output/basic", post(|multipart| handle_output(multipart, NetworkParse::Never)));

    let port = std::env::var("PORT").unwrap_or_else(|_| "3030".to_string());
    let addr = SocketAddr::from(([0, 0, 0, 0], port.parse().unwrap()));
    println!("🚀 Listening on http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    serve(listener, app).await.unwrap();
}

async fn handle_parse(mut multipart: Multipart) -> Result<Json<ReplayResponse>, (StatusCode, Json<Value>)> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let data = field.bytes().await.unwrap();

        match ParserBuilder::new(&data).parse() {
            Ok(replay) => {
                let wrapper = ReplayWrapper::new(&replay);
                let response = wrapper.build_response();
                return Ok(Json(response))
            },
            Err(e) => return Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))
        }
    }

    Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "No replay file received" }))))
}

async fn handle_output(mut multipart: Multipart, has_network_frames: NetworkParse) -> Result<Json<Replay>, (StatusCode, Json<Value>)> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let data = field.bytes().await.unwrap();

        match ParserBuilder::new(&data).with_network_parse(has_network_frames).parse() {
            Ok(replay) => return Ok(Json(replay)),
            Err(e) => return Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))
        }
    }

    Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "No replay file received" }))))
}

async fn handle_basic_parse(mut multipart: Multipart) -> impl IntoResponse {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let data = field.bytes().await.unwrap();

        match ParserBuilder::new(&data).never_parse_network_data().parse() {
            Ok(replay) => {
                let props = &replay.properties;

                let find_str = |key: &str| {
                    props
                        .iter()
                        .find(|(k, _)| k == key)
                        .and_then(|(_, v)| v.as_string())
                        .unwrap_or("Unknown")
                        .to_string()
                };

                let find_i32 = |key: &str| {
                    props
                        .iter()
                        .find(|(k, _)| k == key)
                        .and_then(|(_, v)| v.as_i32())
                        .unwrap_or(0)
                };

                let players = props
                    .iter()
                    .find(|(k, _)| k == "PlayerStats")
                    .and_then(|(_, v)| v.as_array())
                    .map(|arr| {
                        arr.iter()
                            .map(|player| {
                                let lookup = |key: &str| {
                                    player
                                        .iter()
                                        .find(|(k, _)| k == key)
                                        .map(|(_, v)| v)
                                };
                                json!({
                                    "name": lookup("Name").and_then(|v| v.as_string()).unwrap_or("Unknown"),
                                    "goals": lookup("Goals").and_then(|v| v.as_i32()).unwrap_or(0),
                                    "assists": lookup("Assists").and_then(|v| v.as_i32()).unwrap_or(0),
                                    "saves": lookup("Saves").and_then(|v| v.as_i32()).unwrap_or(0),
                                    "shots": lookup("Shots").and_then(|v| v.as_i32()).unwrap_or(0),
                                    "score": lookup("Score").and_then(|v| v.as_i32()).unwrap_or(0),
                                    "team": lookup("Team").and_then(|v| v.as_i32()).unwrap_or(0),
                                })
                            })
                            .collect::<Vec<_>>()
                    })
                    .unwrap_or_default();

                let response = json!({
                    "match_type": find_str("MatchType"),
                    "score": {
                        "team0": find_i32("Team0Score"),
                        "team1": find_i32("Team1Score"),
                    },
                    "players": players
                });

                return (axum::http::StatusCode::OK, Json(response));
            }
            Err(e) => {
                return (
                    axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": e.to_string() })),
                )
            }
        }
    }

    (
        axum::http::StatusCode::BAD_REQUEST,
        Json(json!({ "error": "No replay file received" })),
    )
}

// {
//     rocket_league_id: properties.Id,
//     match_guid: properties.MatchGuid,
//     date: properties.Date,
//     match_type: properties.MatchType,
// }

// let properties = replay.properties;
// let get_prop = |key: &str| -> Option<String> {
//     properties.iter()
//         .find(|(k, _)| k == key)
//         .and_then(|(_, v)| match v {
//             HeaderProp::Str(s) => Some(s.clone()),
//             HeaderProp::Int(i) => Some(i.to_string()),
//             HeaderProp::Float(f) => Some(f.to_string()),
//             HeaderProp::Bool(b) => Some(b.to_string()),
//             _ => None
//         })
// };

// let response = json!({
//     "rocket_league_id": get_prop("Id"),
//     "match_guid": get_prop("MatchGuid"),
//     "date": get_prop("Date"),
//     "match_type": get_prop("MatchType")
// });