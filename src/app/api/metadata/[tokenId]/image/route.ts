import { NextRequest, NextResponse } from 'next/server';

/**
 * NFT Image Generator
 * 
 * Generates a simple SVG image for each NFT.
 * Uses NEXT_PUBLIC_GAME_NAME from environment variable.
 */

// Decode token ID to extract coordinates
function decodeTokenId(tokenId: string): {
  xPoint: number;
  yPoint: number;
} {
  const id = BigInt(tokenId);
  const xPoint = Number(id & BigInt(0xFFFF));
  const yPoint = Number((id >> BigInt(16)) & BigInt(0xFFFF));
  return { xPoint, yPoint };
}

function generateSVG(xPoint: number, yPoint: number, gameName: string): string {
  // Calculate position on the image (assuming 1000x1000 grid scaled to 400x400 SVG)
  const dotX = Math.min(Math.max((xPoint / 1000) * 380 + 10, 10), 390);
  const dotY = Math.min(Math.max((yPoint / 1000) * 380 + 10, 10), 390);
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a"/>
          <stop offset="100%" style="stop-color:#1e1b4b"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#a855f7"/>
          <stop offset="100%" style="stop-color:#6366f1"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="url(#bg)"/>
      
      <!-- Grid pattern -->
      <g stroke="#374151" stroke-width="0.5" opacity="0.3">
        ${Array.from({length: 9}, (_, i) => `<line x1="${(i+1)*40}" y1="0" x2="${(i+1)*40}" y2="400"/>`).join('')}
        ${Array.from({length: 9}, (_, i) => `<line x1="0" y1="${(i+1)*40}" x2="400" y2="${(i+1)*40}"/>`).join('')}
      </g>
      
      <!-- Title - Game Name -->
      <text x="200" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
        ${gameName}
      </text>
      
      <!-- Guess marker -->
      <circle cx="${dotX}" cy="${dotY}" r="15" fill="url(#accent)" filter="url(#glow)" opacity="0.9"/>
      <circle cx="${dotX}" cy="${dotY}" r="8" fill="white"/>
      <circle cx="${dotX}" cy="${dotY}" r="5" fill="#a855f7"/>
      
      <!-- Crosshair lines -->
      <line x1="${dotX}" y1="${dotY - 25}" x2="${dotX}" y2="${dotY - 18}" stroke="#a855f7" stroke-width="2"/>
      <line x1="${dotX}" y1="${dotY + 18}" x2="${dotX}" y2="${dotY + 25}" stroke="#a855f7" stroke-width="2"/>
      <line x1="${dotX - 25}" y1="${dotY}" x2="${dotX - 18}" y2="${dotY}" stroke="#a855f7" stroke-width="2"/>
      <line x1="${dotX + 18}" y1="${dotY}" x2="${dotX + 25}" y2="${dotY}" stroke="#a855f7" stroke-width="2"/>
      
      <!-- Bottom info box -->
      <rect x="20" y="350" width="360" height="40" rx="8" fill="#1f2937" opacity="0.9"/>
      <text x="200" y="375" font-family="Arial, sans-serif" font-size="14" fill="#a855f7" text-anchor="middle" font-weight="bold">
        Good Luck! 🎯
      </text>
    </svg>
  `.trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    
    if (!tokenId || !/^\d+$/.test(tokenId)) {
      return new NextResponse('Invalid token ID', { status: 400 });
    }

    const gameName = process.env.NEXT_PUBLIC_GAME_NAME || 'Spot The Ball';
    const { xPoint, yPoint } = decodeTokenId(tokenId);
    const svg = generateSVG(xPoint, yPoint, gameName);

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return new NextResponse('Failed to generate image', { status: 500 });
  }
}
