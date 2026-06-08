import { supabase } from "../config/supabase.js";

export async function publishEvent(event: string, payload: unknown) {
  if (!supabase) return;
  await supabase.from("commerce_events").insert({ event, payload, created_at: new Date().toISOString() });
}
