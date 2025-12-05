/**
 * Game ID Mapping Configuration
 * Maps user-friendly game IDs to actual Supabase UUIDs from environment variables
 */

/**
 * Get the actual UUID for a given game ID
 * @param gameId - The user-friendly game ID (e.g., "game-wld", "game-usdc")
 * @returns The UUID to query in Supabase from env variables, or the original gameId if no mapping exists
 */
export function getGameUUID(gameId: string): string {
  // Map user-friendly IDs to environment variables
  const envVarMap: Record<string, string | undefined> = {
    'game-wld': process.env.NEXT_PUBLIC_GAME_WLD_ID,
    'game-usdc': process.env.NEXT_PUBLIC_GAME_USDC_ID,
  };

  // Return env variable value if it exists, otherwise return the original gameId
  return envVarMap[gameId] || gameId;
}
