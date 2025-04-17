use super::common::*;
use serde::Serialize;

/// Top-level network frames structure
#[derive(Debug, Serialize)]
pub struct NetworkFrames {
    pub frames: Vec<Frame>,
}

/// Represents a single network frame
#[derive(Debug, Serialize)]
pub struct Frame {
    pub time: f32,
    pub delta: f32,
    pub new_actors: Vec<NewActor>,
    pub deleted_actors: Vec<u32>,
    pub updated_actors: Vec<UpdatedActor>,
}

/// Represents an actor created during a frame
#[derive(Debug, Serialize)]
pub struct NewActor {
    pub actor_id: u32,
    pub name_id: u32,
    pub object_id: u32,
    pub initial_trajectory: InitialTrajectory,
}

/// Represents the starting location/rotation of a new actor
#[derive(Debug, Serialize)]
pub struct InitialTrajectory {
    pub location: Option<Location>,
    pub rotation: Option<Rotation>,
}

/// Represents an actor that was updated in a frame
#[derive(Debug, Serialize)]
pub struct UpdatedActor {
    pub actor_id: u32,
    pub stream_id: u32,
    pub object_id: u32,
    pub attribute: Attribute,
}

/// Dynamic attribute data associated with an updated actor
#[derive(Debug, Serialize)]
pub struct Attribute {
    pub active_actor: Option<ActiveActor>,
    pub string: Option<String>,
    pub boolean: Option<bool>,
    pub reservation: Option<Reservation>,
    pub int: Option<i32>,
    pub rigid_body: Option<RigidBody>,
    pub byte: Option<u8>,
    pub unique_id: Option<UniqueId2>,
    pub int64: Option<String>,
    pub float: Option<f32>,
    pub party_leader: Option<PartyLeader>,
    pub loadouts_online: Option<LoadoutsOnline>,
    pub team_loadout: Option<TeamLoadout>,
    pub cam_settings: Option<CamSettings>,
    pub team_paint: Option<TeamPaint>,
    pub replicated_boost: Option<ReplicatedBoost>,
    pub location: Option<Location>,
    pub pickup_new: Option<PickupNew>,
    pub enum_val: Option<u8>,
    pub demolish_extended: Option<DemolishExtended>,
    pub stat_event: Option<StatEvent>,
    pub extended_explosion: Option<ExtendedExplosion>,
}

/// Whether another actor is active
#[derive(Debug, Serialize)]
pub struct ActiveActor {
    pub active: bool,
    pub actor: u32,
}

/// Player reservation struct
#[derive(Debug, Serialize)]
pub struct Reservation {
    pub number: u32,
    pub unique_id: UniqueId,
    pub name: String,
    pub unknown1: bool,
    pub unknown2: bool,
    pub unknown3: u32,
}

/// Rigid body physics
#[derive(Debug, Serialize)]
pub struct RigidBody {
    pub sleeping: bool,
    pub location: Location,
    pub rotation: RotationQuat,
    pub linear_velocity: Option<Vector3>,
    pub angular_velocity: Option<Vector3>,
}

/// Actor ID + platform combo
#[derive(Debug, Serialize)]
pub struct UniqueId2 {
    pub system_id: u8,
    pub remote_id: RemoteId,
    pub local_id: u32,
}

#[derive(Debug, Serialize)]
pub struct PartyLeader {
    pub system_id: u8,
    pub remote_id: RemoteId,
    pub local_id: u32,
}

#[derive(Debug, Serialize)]
pub struct LoadoutsOnline {
    pub blue: Vec<Vec<LoadoutValue>>,
    pub orange: Vec<Vec<LoadoutValue>>,
    pub unknown1: bool,
    pub unknown2: bool,
}

#[derive(Debug, Serialize)]
pub struct LoadoutValue {
    pub unknown: bool,
    pub object_ind: u32,
    pub value: LoadoutDetail,
}

#[derive(Debug, Serialize)]
pub struct LoadoutDetail {
    pub new_paint: Option<u32>,
    pub new_color: Option<u32>,
    pub title: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TeamLoadout {
    pub blue: LoadoutConfig,
    pub orange: LoadoutConfig,
}

#[derive(Debug, Serialize)]
pub struct LoadoutConfig {
    pub version: u32,
    pub body: u32,
    pub decal: u32,
    pub wheels: u32,
    pub rocket_trail: u32,
    pub antenna: u32,
    pub topper: u32,
    pub unknown1: u32,
    pub unknown2: u32,
    pub engine_audio: u32,
    pub trail: u32,
    pub goal_explosion: u32,
    pub banner: u32,
    pub product_id: u32,
}

#[derive(Debug, Serialize)]
pub struct CamSettings {
    pub fov: f32,
    pub height: f32,
    pub angle: f32,
    pub distance: f32,
    pub stiffness: f32,
    pub swivel: f32,
    pub transition: f32,
}

#[derive(Debug, Serialize)]
pub struct TeamPaint {
    pub team: u32,
    pub primary_color: u32,
    pub accent_color: u32,
    pub primary_finish: u32,
    pub accent_finish: u32,
}

#[derive(Debug, Serialize)]
pub struct ReplicatedBoost {
    pub grant_count: u32,
    pub boost_amount: f32,
    pub unused1: u32,
    pub unused2: u32,
}

#[derive(Debug, Serialize)]
pub struct PickupNew {
    pub instigator: Option<u32>,
    pub picked_up: u32,
}

#[derive(Debug, Serialize)]
pub struct DemolishExtended {
    pub attacker_pri: ActorRef,
    pub self_demo: ActorRef,
    pub self_demolish: bool,
    pub goal_explosion_owner: ActorRef,
    pub attacker: ActorRef,
    pub victim: ActorRef,
    pub attacker_velocity: Vector3,
    pub victim_velocity: Vector3,
}

#[derive(Debug, Serialize)]
pub struct ActorRef {
    pub active: bool,
    pub actor: u32,
}

#[derive(Debug, Serialize)]
pub struct StatEvent {
    pub unknown1: bool,
    pub object_id: u32,
}

#[derive(Debug, Serialize)]
pub struct ExtendedExplosion {
    pub explosion: Explosion,
    pub unknown1: bool,
    pub secondary_actor: u32,
}

#[derive(Debug, Serialize)]
pub struct Explosion {
    pub flag: bool,
    pub actor: u32,
    pub location: Location,
}
