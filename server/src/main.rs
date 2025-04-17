// main.rs
use axum::{
    extract::Multipart, http::StatusCode, response::IntoResponse, routing::post, Json, Router,
};
use boxcars::{NetworkParse, ParserBuilder, Replay};
use serde_json::{json, Value};
use std::net::SocketAddr;
use tokio::net::TcpListener;

mod types;
use crate::types::{ReplayResponse, ReplayStatus, ReplayWrapper};

#[tokio::main]
async fn main() {
    let app: Router = Router::new()
        .route("/parse", post(handle_parse))
        .route("/parse/basic", post(handle_basic_parse))
        .route("/output", post(|m| handle_output(m, NetworkParse::Always)))
        .route(
            "/output/basic",
            post(|m| handle_output(m, NetworkParse::Never)),
        );

    let port = std::env::var("PORT").unwrap_or_else(|_| "3030".to_string());
    let addr = SocketAddr::from(([0, 0, 0, 0], port.parse().unwrap()));
    println!("🚀 Listening on http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handle_parse(
    mut multipart: Multipart,
) -> Result<Json<ReplayResponse>, (StatusCode, Json<Value>)> {
    parse_multipart_replay(multipart, |replay| {
        let wrapper = ReplayWrapper::new(replay);
        Ok(Json(wrapper.build_response()))
    })
    .await
}

async fn handle_basic_parse(mut multipart: Multipart) -> impl IntoResponse {
    parse_multipart_replay(multipart, |replay| {
        let props = &replay.properties;
        let extract_str = |k: &str| {
            props
                .iter()
                .find(|(key, _)| key == k)
                .and_then(|(_, v)| v.as_string())
                .unwrap_or("Unknown")
                .to_string()
        };
        let extract_i32 = |k: &str| {
            props
                .iter()
                .find(|(key, _)| key == k)
                .and_then(|(_, v)| v.as_i32())
                .unwrap_or(0)
        };

        let players =
            props
                .iter()
                .find(|(k, _)| k == "PlayerStats")
                .and_then(|(_, v)| v.as_array())
                .map(|arr| {
                    arr.iter().map(|player| {
                let get = |key: &str| player.iter().find(|(k, _)| k == key).map(|(_, v)| v);
                json!({
                    "name": get("Name").and_then(|v| v.as_string()).unwrap_or("Unknown"),
                    "goals": get("Goals").and_then(|v| v.as_i32()).unwrap_or(0),
                    "assists": get("Assists").and_then(|v| v.as_i32()).unwrap_or(0),
                    "saves": get("Saves").and_then(|v| v.as_i32()).unwrap_or(0),
                    "shots": get("Shots").and_then(|v| v.as_i32()).unwrap_or(0),
                    "score": get("Score").and_then(|v| v.as_i32()).unwrap_or(0),
                    "team": get("Team").and_then(|v| v.as_i32()).unwrap_or(0),
                })
            }).collect::<Vec<_>>()
                })
                .unwrap_or_default();

        let response = json!({
            "match_type": extract_str("MatchType"),
            "score": {
                "team0": extract_i32("Team0Score"),
                "team1": extract_i32("Team1Score"),
            },
            "players": players
        });

        Ok(Json(response))
    })
    .await
}

async fn handle_output(
    mut multipart: Multipart,
    parse_network: NetworkParse,
) -> Result<Json<Replay>, (StatusCode, Json<Value>)> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let data = field.bytes().await.unwrap();
        let parsed = ParserBuilder::new(&data)
            .with_network_parse(parse_network)
            .parse();

        return parsed.map(Json).map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": e.to_string() })),
            )
        });
    }
    Err((
        StatusCode::BAD_REQUEST,
        Json(json!({ "error": "No replay file received" })),
    ))
}

async fn parse_multipart_replay<T, F>(
    mut multipart: Multipart,
    parser: F,
) -> Result<T, (StatusCode, Json<Value>)>
where
    F: FnOnce(&Replay) -> Result<T, (StatusCode, Json<Value>)>,
{
    while let Some(field) = multipart.next_field().await.unwrap() {
        let data = field.bytes().await.unwrap();
        match ParserBuilder::new(&data).parse() {
            Ok(replay) => return parser(&replay),
            Err(e) => {
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": e.to_string() })),
                ))
            }
        }
    }
    Err((
        StatusCode::BAD_REQUEST,
        Json(json!({ "error": "No replay file received" })),
    ))
}
