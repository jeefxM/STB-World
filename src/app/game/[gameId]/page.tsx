'use client';

import { SpotTheBall } from '@/components/SpotTheBall';
import { useParams } from 'next/navigation';

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as string;

  return <SpotTheBall gameId={gameId} />;
}
