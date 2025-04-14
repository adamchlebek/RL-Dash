use axum::{
    extract::Multipart,
    routing::post,
    Router,
    response::IntoResponse,
    Json,
    serve,
};
use boxcars::ParserBuilder;
use serde_json::json;
use tokio::net::TcpListener;
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = Router::new().route("/parse", post(handle_parse));

    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    println!("🚀 Listening on http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    serve(listener, app).await.unwrap();
}

async fn handle_parse(mut multipart: Multipart) -> impl IntoResponse {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let _filename = field.file_name().unwrap_or("file.replay");
        let data = field.bytes().await.unwrap();

        match ParserBuilder::new(&data).parse() {
            Ok(replay) => {
                return (axum::http::StatusCode::OK, Json(json!(replay)))
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
