import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { auth } from '@/auth';
import { getGameUUID } from '@/config/gameIdMap';

// Submission request body type
interface SubmissionRequest {
  gameId: string;
  playerWallet: string;
  xCoordinate: number;
  yCoordinate: number;
  txHash: string;
  tokenId?: string;
  metadata?: Record<string, any>;
}

/**
 * POST /api/submissions
 * Save a game submission to Supabase
 * Requires service role key (server-side only)
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SubmissionRequest = await request.json();
    
    // Validate required fields
    if (!body.gameId || !body.playerWallet || body.xCoordinate === undefined || body.yCoordinate === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: gameId, playerWallet, xCoordinate, yCoordinate' },
        { status: 400 }
      );
    }

    // Validate coordinates are valid numbers
    if (body.xCoordinate < 0 || body.yCoordinate < 0) {
      return NextResponse.json(
        { error: 'Invalid coordinates - must be positive numbers' },
        { status: 400 }
      );
    }

    // Insert submission into Supabase using service role
    const { data, error } = await supabaseAdmin
      .from('submissions')
      .insert({
        game_id: body.gameId,
        player_wallet: body.playerWallet,
        x_coordinate: Math.round(body.xCoordinate),
        y_coordinate: Math.round(body.yCoordinate),
        tx_hash: body.txHash || null,
        token_id: body.tokenId || null,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      
      // Check for duplicate tx_hash
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Submission already exists for this transaction' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to save submission', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Submission saved succesfully:', data.id);

    return NextResponse.json({
      success: true,
      submission: {
        id: data.id,
        gameId: data.game_id,
        playerWallet: data.player_wallet,
        xCoordinate: data.x_coordinate,
        yCoordinate: data.y_coordinate,
        txHash: data.tx_hash,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/submissions
 * Get submissions for a game or player with game status info
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const playerWallet = searchParams.get('playerWallet');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch submissions
    let query = supabaseAdmin
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by game
    if (gameId) {
      query = query.eq('game_id', gameId);
    }

    // Filter by player
    if (playerWallet) {
      query = query.eq('player_wallet', playerWallet);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    // Get unique game IDs to fetch game statuses
    const rawGameIds = [...new Set(submissions.map((s) => s.game_id))];
    
    // Convert friendly IDs (like 'game-wld') to UUIDs
    const gameIdToUuid: Record<string, string> = {};
    const gameUuids: string[] = [];
    
    for (const id of rawGameIds) {
      // Check if it's a friendly ID (not a UUID format)
      if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const uuid = getGameUUID(id);
        gameIdToUuid[id] = uuid;
        gameUuids.push(uuid);
      } else {
        gameIdToUuid[id] = id;
        gameUuids.push(id);
      }
    }
    
    console.log('[GET submissions] Raw game IDs:', rawGameIds);
    console.log('[GET submissions] Converted UUIDs:', gameUuids);
    
    // Fetch game statuses and image URLs
    let gamesMap: Record<string, { status: string; name: string; winner_wallet: string; image_url: string }> = {};
    
    if (gameUuids.length > 0) {
      const { data: games, error: gamesError } = await supabaseAdmin
        .from('games')
        .select('game_id, status, name, winner_wallet, challenge_image_url')
        .in('game_id', gameUuids);
      
      console.log('[GET submissions] Games query result:', { games, error: gamesError });
      
      if (games) {
        gamesMap = games.reduce((acc, game) => {
          acc[game.game_id] = {
            status: game.status,
            name: game.name,
            winner_wallet: game.winner_wallet,
            image_url: game.challenge_image_url,
          };
          return acc;
        }, {} as Record<string, { status: string; name: string; winner_wallet: string; image_url: string }>);
      }
    }
    
    console.log('[GET submissions] Games map:', gamesMap);

    // Combine submissions with game info
    const submissionsWithGameInfo = submissions.map((s) => {
      // Use the translated UUID to look up game info
      const translatedUuid = gameIdToUuid[s.game_id] || s.game_id;
      const gameInfo = gamesMap[translatedUuid] || { status: 'active', name: null, winner_wallet: null, image_url: null };
      const isWinner = gameInfo.winner_wallet?.toLowerCase() === s.player_wallet?.toLowerCase();
      
      return {
        id: s.id,
        game_id: s.game_id,
        player_wallet: s.player_wallet,
        x_coordinate: s.x_coordinate,
        y_coordinate: s.y_coordinate,
        tx_hash: s.tx_hash,
        token_id: s.token_id,
        created_at: s.created_at,
        game_status: gameInfo.status,
        game_name: gameInfo.name,
        game_image_url: gameInfo.image_url,
        prize_won: isWinner ? '0.5' : null, // TODO: Get actual prize from contract
      };
    });

    return NextResponse.json({
      submissions: submissionsWithGameInfo,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
