import { supabase } from "@/lib/supabase";

export const tournamentManagementService = {
  async createTournament() {
    const { data: existingTournaments } = await supabase
      .from("tournaments")
      .select("name")
      .ilike("name", "Squid Game Round%")
      .order("created_at", { ascending: false });

    // Calculate the next round number
    const nextRound = existingTournaments && existingTournaments.length > 0
      ? existingTournaments.length + 1
      : 1;

    const { data: tournament, error } = await supabase
      .from("tournaments")
      .insert({
        name: `Squid Game Round ${nextRound}`,
        status: "waiting",
        max_players: 8,
        current_players: 0
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

    // Update tournament with current number of players
    await supabase
      .from("tournaments")
      .update({
        current_players: players.length
      })
      .eq("id", tournament.id);
  }
};