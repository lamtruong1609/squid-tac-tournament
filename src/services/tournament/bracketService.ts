import { supabase } from "@/lib/supabase";
import { Tournament, Player } from "./types";

export const bracketService = {
  async createInitialMatches(tournamentId: string, players: Player[]) {
    if (players.length < 2) return;

    // Shuffle players randomly
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const matchPromises = [];
    const playerMatches = new Set();

    // Create matches ensuring each player only plays once
    for (let i = 0; i < shuffledPlayers.length - 1; i += 2) {
      const player1 = shuffledPlayers[i].id;
      const player2 = shuffledPlayers[i + 1].id;
      
      // Create a unique key for this pair
      const pairKey = [player1, player2].sort().join('-');
      
      if (!playerMatches.has(pairKey)) {
        playerMatches.add(pairKey);
        matchPromises.push(
          supabase
            .from("games")
            .insert({
              tournament_id: tournamentId,
              player_x: player1,
              player_o: player2,
              board: JSON.stringify(Array(9).fill(null)),
              next_player: 'X',
              status: 'waiting',
              round: 1,
              turns_history: '[]'
            })
        );
      }
    }

    await Promise.all(matchPromises);

    // Update tournament with current number of players
    await supabase
      .from("tournaments")
      .update({
        current_players: players.length
      })
      .eq("id", tournamentId);
  },

  async createNextRoundMatches(tournamentId: string, currentRound: number) {
    // Get winners from the current round
    const { data: currentMatches } = await supabase
      .from("games")
      .select("winner")
      .eq("tournament_id", tournamentId)
      .eq("round", currentRound)
      .not("winner", "is", null);

    if (!currentMatches) return;

    const winners = currentMatches.map(match => match.winner);
    const nextRound = currentRound + 1;

    // Shuffle winners randomly
    const shuffledWinners = [...winners].sort(() => Math.random() - 0.5);
    const matchPromises = [];

    // Create matches for the next round
    for (let i = 0; i < shuffledWinners.length - 1; i += 2) {
      matchPromises.push(
        supabase
          .from("games")
          .insert({
            tournament_id: tournamentId,
            player_x: shuffledWinners[i],
            player_o: shuffledWinners[i + 1],
            board: JSON.stringify(Array(9).fill(null)),
            next_player: 'X',
            status: 'waiting',
            round: nextRound,
            turns_history: '[]'
          })
      );
    }

    await Promise.all(matchPromises);

    // Update tournament round
    await supabase
      .from("tournaments")
      .update({
        current_round: nextRound
      })
      .eq("id", tournamentId);

    // If only two players remain, mark as final round
    if (shuffledWinners.length === 2) {
      await supabase
        .from("tournaments")
        .update({
          is_final_round: true
        })
        .eq("id", tournamentId);
    }
  }
};