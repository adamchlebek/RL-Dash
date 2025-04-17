use axum::{extract::Multipart, http::StatusCode, routing::post, Json, Router};
use boxcars::{NetworkParse, ParserBuilder, Replay};
use serde_json::{json, Value};
use std::net::SocketAddr;
use tokio::net::TcpListener;

mod helpers;
mod parser;
mod types;

use crate::parser::parse_to_ballchasing;
use crate::types::BallchasingReplay;

#[tokio::main]
async fn main() {
    let app: Router = Router::new()
        .route("/parse", post(handle_parse))
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

// /parse -> Returns Ballchasing-style response
async fn handle_parse(
    multipart: Multipart,
) -> Result<Json<BallchasingReplay>, (StatusCode, Json<Value>)> {
    parse_multipart_replay(multipart, |replay| {
        let data = parse_to_ballchasing(replay);
        Ok(Json(data))
    })
    .await
}

// /output & /output/basic -> Return raw Replay
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

// Shared helper for parsing replay from multipart upload
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
