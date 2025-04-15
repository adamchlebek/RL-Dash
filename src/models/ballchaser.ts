import { ReplayStatus } from "@/types";

export interface ProcessingResult {
  id: string;
  ballchasingId: string;
  status: ReplayStatus;
  message?: string;
}

export interface StatEntity {
  core?: Record<string, number>;
  boost?: Record<string, number>;
  ball?: Record<string, number>;
  movement?: Record<string, number>;
  positioning?: Record<string, number>;
  demo?: Record<string, number>;
}

export interface PlayerData {
  name?: string;
  id?: {
    platform?: string;
    id?: string;
  };
  car_name?: string;
  car_id?: number;
  start_time?: number;
  end_time?: number;
  steering_sensitivity?: number;
  mvp?: boolean;
  camera?: {
    fov?: number;
    height?: number;
    pitch?: number;
    distance?: number;
    stiffness?: number;
    swivel_speed?: number;
    transition_speed?: number;
  };
  stats?: StatEntity;
}

export interface TeamData {
  name?: string;
  players?: PlayerData[];
  stats?: StatEntity;
}
