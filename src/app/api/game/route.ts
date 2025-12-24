import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

/**
 * GET /api/game?gameId=<uuid>
 * Fetch game info including contract address, image, and submission count
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    
    const { data, error } = await supabase
      .from("games")
      .select("game_id, contract_address, name, status, challenge_image_url, total_submissions")
      .eq("game_id", gameId)
      .single();

    if (error) {
      console.error("Error fetching game:", error);
      return NextResponse.json(
        { error: "Failed to fetch game" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      game_id: data.game_id,
      contract_address: data.contract_address,
      name: data.name,
      status: data.status,
      image_url: data.challenge_image_url,
      total_submissions: data.total_submissions || 0,
    });
  } catch (error) {
    console.error("Game API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
