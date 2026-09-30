import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

let supabaseClient = null;
let isConfigured = false;

if (ENV.SUPABASE_URL && (ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY)) {
  try {
    const key = ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY;
    supabaseClient = createClient(ENV.SUPABASE_URL, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isConfigured = true;
    console.log('[Database] Connected to remote Supabase database instance:', ENV.SUPABASE_URL);
  } catch (error) {
    console.warn('[Database] Failed to initialize Supabase client:', error.message);
  }
} else {
  console.log('[Database] Supabase URL/Key not set in .env. Initializing high-performance resilient local data adapter.');
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = () => isConfigured && !!supabaseClient;
