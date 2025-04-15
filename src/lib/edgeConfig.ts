import { supabase } from "./supabase";

interface EdgeConfigValue {
  value: boolean;
}

export async function getEdgeConfig(key: string): Promise<EdgeConfigValue | null> {
  const { data, error } = await supabase.functions.invoke("edge-config", {
    body: { action: "get", key },
  });

  if (error) throw error;
  return data;
}

export async function setEdgeConfig(key: string, value: EdgeConfigValue): Promise<void> {
  const { error } = await supabase.functions.invoke("edge-config", {
    body: { action: "set", key, value },
  });

  if (error) throw error;
} 