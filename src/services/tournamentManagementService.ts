import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const tournamentManagementService = {
  async createTournament() {
    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .insert({
        name: `Tournament ${new Date().toLocaleDateString()}`,
        status: "waiting",
        max_players: 100,
        current_players: 0,
      })
      .select()
      .single();

    if (tournamentError) throw tournamentError;
    return tournament;
  },

  async getAvailablePlayers() {
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")
      .order('created_at', { ascending: false });

    if (playersError) throw playersError;
    return players;
  },

  async createInitialMatches(tournament: any, players: any[]) {
    if (players.length < 2) return;

    // Create unique pairs of players
    const matchPromises = [];
    const playerPairs = new Set();

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i].id;
        const player2 = players[j].id;
        
        // Create a unique key for this pair (order doesn't matter)
        const pairKey = [player1, player2].sort().join('-');
        
        if (!playerPairs.has(pairKey)) {
          playerPairs.add(pairKey);
          matchPromises.push(
            supabase
              .from("games")
              .insert({
                tournament_id: tournament.id,
                player_x: player1,
                player_o: player2,
                board: JSON.stringify(Array(9).fill(null)),
                next_player: 'X',
                status: 'waiting'
              })
          );
        }
      }
    }

    await Promise.all(matchPromises);

    // Update tournament's current_players count
    await supabase
      .from("tournaments")
      .update({ 
        current_players: players.length,
        status: players.length >= 2 ? 'in_progress' : 'waiting'
      })
      .eq('id', tournament.id);
  }
};