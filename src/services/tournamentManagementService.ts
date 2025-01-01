import { supabase } from "@/lib/supabase";
import { bracketService } from "./bracketService";

export const tournamentManagementService = {
  async createTournament(maxPlayers: number = 8) {
    // Ensure maxPlayers is a power of 2 for proper bracket structure
    const validMaxPlayers = Math.pow(2, Math.floor(Math.log2(maxPlayers)));
    
    const { data: existingTournaments } = await supabase
      .from("tournaments")
      .select("name")
      .ilike("name", "Squid Game Tournament%")
      .order("created_at", { ascending: false });

    const nextNumber = existingTournaments && existingTournaments.length > 0
      ? existingTournaments.length + 1
      : 1;

    const { data: tournament, error } = await supabase
      .from("tournaments")
      .insert({
        name: `Squid Game Tournament ${nextNumber}`,
        status: "waiting",
        max_players: validMaxPlayers,
        current_players: 0,
        current_round: 1
      })
      .select()
      .single();

    if (error) throw error;
    return tournament;
  },

  async getAvailablePlayers() {
    const { data: players, error } = await supabase
      .from("players")
      .select("*");

    if (error) throw error;
    return players;
  },

  async startTournament(tournament: any, players: any[]) {
    try {
      // Update tournament status to in_progress
      const { error: updateError } = await supabase
        .from("tournaments")
        .update({ status: "in_progress" })
        .eq("id", tournament.id);

      if (updateError) throw updateError;

      // Create initial matches using bracketService
      await bracketService.createInitialMatches(tournament.id, players);

      return players.length;
    } catch (error) {
      console.error('Error in startTournament:', error);
      throw error;
    }
  },

  async createInitialMatches(tournament: any, players: any[]) {
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
              tournament_id: tournament.id,
              player_x: player1,
              player_o: player2,
              board: JSON.stringify(Array(9).fill(null)),
              next_player: 'X',
              status: 'waiting',
              round: 1
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
      .eq("id", tournament.id);
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
            round: nextRound
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
