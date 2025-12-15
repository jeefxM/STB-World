import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client
 * Used in Server Components and API routes
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

// Create a new client for each request (no caching issues)
export function createServerSupabase() {
  return createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  );
}

// Game data type
export interface GameData {
  game_id: string;
  contract_address: string;
  challenge_image_url: string;
  name: string;
  custom_prompt: string | null;
  total_submissions: number;
}

/**
 * Fetch game data from Supabase (server-side)
 */
export async function getGameData(gameUUID: string): Promise<GameData | null> {
  const supabase = createServerSupabase();
  
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('game_id', gameUUID)
    .single();
  
  if (error) {
    console.error('Error fetching game:', error);
    return null;
  }
  
  return data as GameData;
}
