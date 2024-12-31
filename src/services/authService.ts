import { supabase } from '@/lib/supabase';

export const authService = {
  async loginPlayer(playerName: string, password: string) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('name', playerName)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Player not found');
    if (data.password !== password) throw new Error('Invalid password');

    localStorage.setItem('playerId', data.id);
    localStorage.setItem('playerName', data.name);
    return data;
  },

  async getPlayerTournaments(playerId: string) {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        tournament:tournament_id (
          id,
          name,
          status
        )
      `)
      .or(`player_x.eq.${playerId},player_o.eq.${playerId}`)
      .not('tournament_id', 'is', null);

    if (error) throw error;
    return data;
  },

  isLoggedIn() {
    return !!localStorage.getItem('playerId');
  },

  logout() {
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerName');
  }
};