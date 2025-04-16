use axum::{
    extract::Multipart,
    routing::post,
    Router,
    Json,
    serve,
    http::StatusCode,
};
use boxcars::{ParserBuilder, Replay};
use serde_json::{json, Value};
use tokio::net::TcpListener;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app: Router = Router::new().route("/parse", post(handle_parse));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3030));
    println!("🚀 Listening on http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    serve(listener, app).await.unwrap();
}

async fn handle_parse(mut multipart: Multipart) -> Result<Json<Replay>, (StatusCode, Json<Value>)> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let _filename = field.file_name().unwrap_or("file.replay");
        let data = field.bytes().await.unwrap();

        match ParserBuilder::new(&data).parse() {
            Ok(replay) => return Ok(Json(replay)),
            Err(e) => return Err((StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))
        }
    }

    Err((StatusCode::BAD_REQUEST, Json(json!({ "error": "No replay file received" }))))
}
