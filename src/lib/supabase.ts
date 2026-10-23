import { createClient, SupabaseClient } from "@supabase/supabase-js";

const clean = (v?: string) => (v ?? "").trim().replace(/^["']|["']$/g, "");

const rawUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const rawKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const hasValidUrl = /^https?:\/\//i.test(rawUrl);

if (!hasValidUrl || !rawKey) {
  console.warn(
    "[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Usando valores placeholder."
  );
}

export const supabase: SupabaseClient = createClient(
  hasValidUrl ? rawUrl : "https://placeholder.supabase.co",
  rawKey || "placeholder-anon-key"
);