import { getGameData, type GameData } from '@/lib/supabaseServer';
import { getGameUUID } from '@/config/gameIdMap';
import { SpotTheBallClient } from '@/components/game/SpotTheBallClient';

interface GamePageProps {
  params: Promise<{ gameId: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  const gameUUID = getGameUUID(gameId);
  
  // Fetch game data SERVER-SIDE (fast!)
  const gameData = await getGameData(gameUUID);
  
  if (!gameData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-medium">Game not found</p>
          <p className="text-slate-500 text-sm mt-2">The game &quot;{gameId}&quot; could not be loaded.</p>
        </div>
      </div>
    );
  }
  
  // Pass pre-fetched data to Client Component
  return (
    <SpotTheBallClient
      gameId={gameUUID}
      initialGameData={{
        contractAddress: gameData.contract_address as `0x${string}`,
        imageUrl: gameData.challenge_image_url,
        title: gameData.name || 'Spot The Ball',
        description: gameData.custom_prompt || 'Find the ball!',
        gameName: gameData.name,
      }}
    />
  );
}
