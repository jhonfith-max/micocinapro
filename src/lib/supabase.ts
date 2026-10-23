import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gmaugonuxprrvhpmmphe.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_yItqY0eG0Q0NeTKN7-b1Qg__FIuNJbB";

export const supabase = createClient(url, key);