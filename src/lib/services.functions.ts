import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { serviceRequestSchema } from "./services";
import type { Database } from "@/integrations/supabase/types";

export const submitServiceRequest = createServerFn({ method: "POST" }).inputValidator(serviceRequestSchema).handler(async ({ data }) => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey",key); return fetch(input,{...init,headers:h}); } },
  });
  const { error } = await client.from("service_requests").insert(data);
  if (error) throw new Error(error.message);
  return { id: data.id };
});

export const weddingMedia = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, { auth: { persistSession:false, autoRefreshToken:false }, global: { fetch:(input,init)=>{ const h=new Headers(init?.headers);if(key.startsWith("sb_") && h.get("Authorization")===`Bearer ${key}`) h.delete("Authorization");h.set("apikey",key);return fetch(input,{...init,headers:h}); } } });
  const {data,error}=await client.from("wedding_media").select("slot,image_url,thumb_url,placeholder");
  if(error) throw new Error(error.message);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return Promise.all((data ?? []).map(async row => {
    const sign = async (path:string) => {
      if(path.startsWith("/__l5e/assets-v1/")) return path;
      if(!/^[0-9a-f-]{36}\/(main|thumb|original)\.(webp|jpg|png)$/.test(path)) return "";
      const {data:s}=await supabaseAdmin.storage.from("service-photos").createSignedUrl(path,86400);
      return s?.signedUrl ?? "";
    };
    return {...row,image_url:await sign(row.image_url),thumb_url:row.thumb_url ? await sign(row.thumb_url):null};
  }));
});
export const weddingMediaQuery = { queryKey: ["wedding-media"], queryFn: () => weddingMedia() };