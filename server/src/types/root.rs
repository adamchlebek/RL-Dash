use super::*;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Root {
    pub header_size: usize,
    pub header_crc: u32,
    pub major_version: u16,
    pub minor_version: u16,
    pub net_version: u32,
    pub game_type: String,
    pub properties: Properties,
    pub content_size: usize,
    pub content_crc: u32,
    pub network_frames: Option<NetworkFrames>,
    pub levels: Vec<String>,
    pub keyframes: Vec<Keyframe>,
    pub debug_info: Vec<String>, // Simplified
    pub tick_marks: Vec<TickMark>,
    pub packages: Vec<String>,
    pub objects: Vec<String>,
    pub names: Vec<String>,
    pub class_indices: Vec<Index>,
    pub net_cache: Vec<NetCache>,
}
