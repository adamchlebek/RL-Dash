import { supabase } from "./supabase";


export async function getEdgeConfig<T>(key: string): Promise<{ value: T } | null> {
  const { data, error } = await supabase.functions.invoke("edge-config", {
    body: { action: "get", key },
  });

  if (error) throw error;

  return data;
}

export async function setEdgeConfig<T>(key: string, value: T): Promise<void> {
  const { error } = await supabase.functions.invoke("edge-config", {
    body: { action: "set", key, value },
  });

  if (error) throw error;
} 