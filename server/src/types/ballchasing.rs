use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct BallchasingReplay {
    pub id: String,
    pub created: String,
    pub status: String,
    pub rocket_league_id: String,
    pub match_guid: String,
    pub title: String,
    pub map_code: String,
    pub match_type: String,
    pub team_size: u8,
    pub playlist_id: String,
    pub duration: f64,
    pub overtime: bool,
    pub overtime_seconds: u32,
    pub date: String,
    pub blue: BallchasingTeam,
    pub orange: BallchasingTeam,
    pub playlist_name: String,
    pub map_name: String,
}

#[derive(Debug, Serialize)]
pub struct BallchasingTeam {
    pub color: String,
    pub name: String,
    pub players: Vec<BallchasingPlayer>,
    pub stats: BallchasingTeamStats,
}

#[derive(Debug, Serialize, Clone)]
pub struct BallchasingPlayer {
    pub name: String,
    pub id: PlayerId,
    pub car_id: u32,
    pub car_name: String,
    pub stats: PlayerStats,
}

#[derive(Debug, Serialize, Clone)]
pub struct PlayerId {
    pub platform: String,
    pub id: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct PlayerStats {
    pub core: CoreStats,
    pub boost: BoostStats,
    pub demo: DemoStats,
}

#[derive(Debug, Serialize, Clone)]
pub struct CoreStats {
    pub shots: u32,
    pub goals: u32,
    pub saves: u32,
    pub assists: u32,
    pub score: u32,
    pub mvp: bool, // TODO ❗
    pub shooting_percentage: u32,
}

#[derive(Debug, Serialize, Clone)]
pub struct BoostStats {
    pub bpm: u32, // TODO ❗
}

#[derive(Debug, Serialize, Clone)]
pub struct DemoStats {
    pub inflicted: u32, // TODO ❗
    pub taken: u32,     // TODO ❗
}

#[derive(Debug, Serialize)]
pub struct BallchasingTeamStats {
    pub core: CoreStats,
    pub demo: DemoStats,
}
