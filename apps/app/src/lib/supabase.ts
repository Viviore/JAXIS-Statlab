import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://aws-0-ap-southeast-1.pooler.supabase.com";
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key";

// Browser client — used in Client Components for Realtime subscriptions
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server client — used in Server Components / API Routes for Storage operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);


