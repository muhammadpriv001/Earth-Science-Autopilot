// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — SUPABASE BROWSER CLIENT
// ==============================================================================

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

export function createClient() {
  if (!isSupabaseConfigured) {
    // Return a dummy client proxy that logs warning instead of crashing
    return {
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
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
    } as any;
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

