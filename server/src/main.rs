use axum::{
    extract::Multipart, http::StatusCode, response::IntoResponse, routing::post, serve, Json, Router,
};
use boxcars::{ParserBuilder, Replay, NetworkParse};
use serde_json::{json, Value};
use tokio::net::TcpListener;
use std::net::SocketAddr;
use crate::types::{ReplayResponse, ReplayStatus, ReplayWrapper};

mod types;

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