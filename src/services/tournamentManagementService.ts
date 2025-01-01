import { supabase } from "@/lib/supabase";
import { bracketService } from "./tournament/bracketService";

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
  }
};