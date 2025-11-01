// Supabase client initialization
import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}

/**
 * Supabase client instance
 * Used for all database queries in API routes and pages
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No authentication needed for public dataset
  },
});

/**
 * Type-safe helper to check if a Supabase response has an error
 */
export function hasSupabaseError<T>(response: {
  data: T | null;
  error: Error | null;
}): response is { data: null; error: Error } {
  return response.error !== null;
}
