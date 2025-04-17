use boxcars::HeaderProp;

/// Returns `true` if the game went into overtime:
/// - match duration is more than 303s
/// - and score difference is exactly 1
pub fn is_overtime(props: &[(String, HeaderProp)]) -> bool {
    let duration = get_f32(props, "TotalSecondsPlayed");
    let team0_score = get_i32(props, "Team0Score");
    let team1_score = get_i32(props, "Team1Score");

    let score_diff = (team0_score - team1_score).abs();

    duration > 303.0 && score_diff == 1
}

/// Calculates overtime duration if overtime occurred (duration - 300)
pub fn get_overtime_seconds(duration: f64, overtime: bool) -> u32 {
    if overtime && duration > 300.0 {
        (duration - 300.0).round() as u32
    } else {
        0
    }
}

/// Helper: safely get f32 from props
pub fn get_f32(props: &[(String, HeaderProp)], key: &str) -> f32 {
    props
        .iter()
        .find(|(k, _)| k == key)
        .and_then(|(_, v)| match v {
            HeaderProp::Float(f) => Some(*f),
            HeaderProp::Int(i) => Some(*i as f32),
            _ => None,
        })
        .unwrap_or(0.0)
}

/// Helper: safely get i32 from props
pub fn get_i32(props: &[(String, HeaderProp)], key: &str) -> i32 {
    props
        .iter()
        .find(|(k, _)| k == key)
        .and_then(|(_, v)| v.as_i32())
        .unwrap_or(0)
}
