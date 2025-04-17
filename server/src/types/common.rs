use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Location {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Debug, Serialize)]
pub struct Rotation {
    pub yaw: Option<f32>,
    pub pitch: Option<f32>,
    pub roll: Option<f32>,
}

#[derive(Debug, Serialize)]
pub struct Index {
    pub class: String,
    pub index: usize,
}

#[derive(Debug, Serialize)]
pub struct Keyframe {
    pub time: f32,
    pub frame: u32,
    pub position: usize,
}

#[derive(Debug, Serialize)]
pub struct TickMark {
    pub description: String,
    pub frame: u32,
}

#[derive(Debug, Serialize)]
pub struct NetCache {
    pub object_ind: u32,
    pub parent_id: u32,
    pub cache_id: u32,
    pub properties: Vec<Property>,
}

#[derive(Debug, Serialize)]
pub struct Property {
    pub object_ind: u32,
    pub stream_id: u32,
}

#[derive(Debug, Serialize)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Debug, Serialize)]
pub struct RotationQuat {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub w: f32,
}

#[derive(Debug, Serialize)]
pub struct RemoteId {
    pub steam: String,
}

#[derive(Debug, Serialize)]
pub struct UniqueId {
    pub system_id: u8,
    pub remote_id: RemoteId,
    pub local_id: u32,
}
