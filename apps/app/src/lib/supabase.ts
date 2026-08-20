import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Browser client — used in Client Components for Realtime subscriptions
export const supabaseClient = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server client — used in Server Components / API Routes for Storage operations
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);
