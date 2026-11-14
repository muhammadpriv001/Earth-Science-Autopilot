// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — SUPABASE BROWSER CLIENT (SINGLETON)
// ==============================================================================

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

let cachedClient: SupabaseClient | any = null;

export function createClient() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!isSupabaseConfigured) {
    // Return a dummy client proxy that logs warning instead of crashing
    cachedClient = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({
          data: null,
          error: new Error('Supabase is not configured. Configure NEXT_PUBLIC_SUPABASE_URL in .env.local.'),
        }),
        signUp: async () => ({
          data: null,
          error: new Error('Supabase is not configured. Configure NEXT_PUBLIC_SUPABASE_URL in .env.local.'),
        }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          eq: () => Promise.resolve({ data: [], error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
        insert: () => ({
          select: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    };
    return cachedClient;
  }

  cachedClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}
