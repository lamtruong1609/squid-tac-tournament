import { supabase } from "@/lib/supabase";
import { Match, Player } from "./types";

export const bracketService = {
  async createNextRoundMatches(tournamentId: string, currentRound: number) {
    // Get winners from the current round
    const { data: currentMatches } = await supabase
      .from("games")
      .select("winner")
      .eq("tournament_id", tournamentId)
      .eq("round", currentRound)
      .not("winner", "is", null);

    if (!currentMatches?.length) return;

    const winners = currentMatches.map(match => match.winner).filter(Boolean);
    const nextRound = currentRound + 1;

    // Create matches for the next round by pairing winners
    for (let i = 0; i < winners.length; i += 2) {
      if (i + 1 < winners.length) {
        await supabase
          .from("games")
          .insert({
            tournament_id: tournamentId,
            player_x: winners[i],
            player_o: winners[i + 1],
            board: JSON.stringify(Array(9).fill(null)),
            next_player: 'X',
            status: 'waiting',
            round: nextRound
          });
      }
    }

    // If we're down to the final two players, mark it as the final round
    if (winners.length === 2) {
      await supabase
        .from("tournaments")
        .update({
          is_final_round: true
        })
        .eq("id", tournamentId);
    }

    // Update tournament round
    await supabase
      .from("tournaments")
      .update({
        current_round: nextRound
      })
      .eq("id", tournamentId);
  },

  async createInitialMatches(tournamentId: string, players: Player[]) {
    // Shuffle players randomly for initial matchups
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Create first round matches
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
      if (i + 1 < shuffledPlayers.length) {
        await supabase
          .from("games")
          .insert({
            tournament_id: tournamentId,
            player_x: shuffledPlayers[i].id,
            player_o: shuffledPlayers[i + 1].id,
            board: JSON.stringify(Array(9).fill(null)),
            next_player: 'X',
            status: 'waiting',
            round: 1
          });
      }
    }

    // Update tournament status and player count
    await supabase
      .from("tournaments")
      .update({
        status: 'in_progress',
        current_players: shuffledPlayers.length,
        current_round: 1
      })
      .eq("id", tournamentId);
  }
};