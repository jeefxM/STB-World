import { NextRequest, NextResponse } from 'next/server';

/**
 * NFT Metadata API
 * 
 * This endpoint returns ERC721 metadata for Spot The Ball NFTs.
 * World App uses this to display nice information instead of raw token IDs.
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_GAME_NAME: The name of the game (e.g., "World Game")
 * - NEXT_PUBLIC_APP_URL: Your app's URL for images
 * 
 * Token ID Structure (encoded in the smart contract):
 * - bits 0-15: xPoint (uint16)
 * - bits 16-31: yPoint (uint16)  
 * - bits 32-63: timestamp (uint32)
 * - bits 64-223: minter address (address/uint160)
 */

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
}

// Decode token ID to extract coordinates and data
function decodeTokenId(tokenId: string): {
  xPoint: number;
  yPoint: number;
  timestamp: number;
  minter: string;
} {
  const id = BigInt(tokenId);
  
  const xPoint = Number(id & BigInt(0xFFFF));
  const yPoint = Number((id >> BigInt(16)) & BigInt(0xFFFF));
  const timestamp = Number((id >> BigInt(32)) & BigInt(0xFFFFFFFF));
  const minter = '0x' + ((id >> BigInt(64)) & BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toString(16).padStart(40, '0');
  
  return { xPoint, yPoint, timestamp, minter };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    
    // Validate tokenId
    if (!tokenId || !/^\d+$/.test(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }

    // Get game name from env
    const gameName = process.env.NEXT_PUBLIC_GAME_NAME || 'Spot The Ball';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spottheball.world';

    // Decode the token ID to get coordinates
    const { xPoint, yPoint, timestamp, minter } = decodeTokenId(tokenId);
    
    // Format timestamp to readable date
    const date = new Date(timestamp * 1000);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Shorten minter address for display
    const shortMinter = `${minter.slice(0, 6)}...${minter.slice(-4)}`;

    // Create metadata with game name
    const metadata: NFTMetadata = {
      name: gameName,
      description: `Entry for ${gameName}. Good luck!`,
      image: `${appUrl}/api/metadata/${tokenId}/image`,
      external_url: `${appUrl}/game`,
      attributes: [
        {
          trait_type: 'Game',
          value: gameName,
        },
        {
          trait_type: 'Entry Date',
          value: formattedDate,
        },
        {
          trait_type: 'Player',
          value: shortMinter,
        },
      ],
    };

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Metadata API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    );
  }
}
