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

    const matchPromises = [];
    for (let i = 0; i < players.length - 1; i += 2) {
      matchPromises.push(
        supabase
          .from("games")
          .insert({
            tournament_id: tournament.id,
            player_x: players[i].id,
            player_o: players[i + 1].id,
            board: JSON.stringify(Array(9).fill(null)),
            next_player: 'X',
            status: 'waiting'
          })
      );
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