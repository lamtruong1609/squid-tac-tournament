import { supabase } from '@/lib/supabase';
import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  expires: 7, // Cookie expires in 7 days
  secure: true, // Only transmitted over HTTPS
  sameSite: 'strict' as const
};

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

    // Set cookies instead of localStorage
    Cookies.set('playerId', data.id, COOKIE_OPTIONS);
    Cookies.set('playerName', data.name, COOKIE_OPTIONS);
    return data;
  },

  async getPlayerInfo(playerId: string) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (error) throw error;
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
    return !!Cookies.get('playerId');
  },

  logout() {
    Cookies.remove('playerId');
    Cookies.remove('playerName');
  }
};