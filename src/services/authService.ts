import { supabase } from '@/lib/supabase';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // In production, this should be an environment variable
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

    const token = jwt.sign(
      { 
        playerId: data.id, 
        playerName: data.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    Cookies.set('auth_token', token, COOKIE_OPTIONS);
    return data;
  },

  async loginWithWallet(address: string) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('name', address)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Player not found');

    const token = jwt.sign(
      { 
        playerId: data.id, 
        playerName: data.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    Cookies.set('auth_token', token, COOKIE_OPTIONS);
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
    const token = Cookies.get('auth_token');
    if (!token) return false;

    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  },

  getLoggedInPlayerId() {
    const token = Cookies.get('auth_token');
    if (!token) return null;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { playerId: string };
      return decoded.playerId;
    } catch {
      return null;
    }
  },

  logout() {
    Cookies.remove('auth_token');
  }
};