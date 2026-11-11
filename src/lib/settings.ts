import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "./data";

export async function saveSettings(settings: Settings): Promise<Settings> {
  const { error } = await supabase.from("settings").upsert(
    { ...settings, id: 1, updated_at: new Date().toISOString() },
    { onConflict: "id" },
  );
  if (error) throw error;
  const { data, error: readError } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (readError) throw readError;
  return data;
}