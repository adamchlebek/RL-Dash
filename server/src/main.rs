use axum::{
    extract::Multipart,
    routing::post,
    Router,
    Json,
    serve,
    http::StatusCode,
};
use boxcars::{ParserBuilder, Replay, HeaderProp};
use serde_json::{json, Value};
use tokio::net::TcpListener;
use std::net::SocketAddr;

#[derive(Debug, serde::Serialize)]
struct ReplayResponse {
    rocket_league_id: Option<String>,
    match_guid: Option<String>,
    date: Option<String>,
    match_type: Option<String>,
    version: Option<String>,
    network_frames: Option<String>,
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
        ReplayResponse {
            rocket_league_id: self.get("properties.Id"),
            match_guid: self.get("properties.MatchGuid"),
            date: self.get("properties.Date"),
            match_type: self.get("properties.MatchType"),
            version: self.get("header.version"),
            network_frames: self.get("network_frames.count"),
        }
    }
}

#[tokio::main]
async fn main() {
    let app: Router = Router::new().route("/parse", post(handle_parse));

    let port = std::env::var("PORT").unwrap_or_else(|_| "3030".to_string());
    let addr = SocketAddr::from(([0, 0, 0, 0], port.parse().unwrap()));
    println!("🚀 Listening on http://{}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    serve(listener, app).await.unwrap();
}

async fn handle_parse(mut multipart: Multipart) -> Result<Json<ReplayResponse>, (StatusCode, Json<Value>)> {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let _filename = field.file_name().unwrap_or("file.replay");
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