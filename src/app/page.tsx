import { getGameData } from '@/lib/supabaseServer';
import { getGameUUID } from '@/config/gameIdMap';
import AppShell from "@/components/core/AppShell";

// Game data interface
interface GameDataProps {
  imageUrl: string;
  playerCount: number;
  roundNumber: number;
}

export default async function HomePage() {
  // Fetch the default game data server-side
  const gameUUID = getGameUUID('game-wld');
  let gameData: GameDataProps | null = null;

  try {
    const data = await getGameData(gameUUID);
    
    if (data && data.challenge_image_url) {
      gameData = {
        imageUrl: data.challenge_image_url,
        playerCount: data.total_submissions || 0,
        roundNumber: 1,
      };
    }
  } catch (error) {
    console.error("[HomePage] Failed to fetch game data:", error);
  }

  return <AppShell gameData={gameData} />;
}

