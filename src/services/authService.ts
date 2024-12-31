import { supabase } from '@/lib/supabase';
import Cookies from 'js-cookie';
import * as jose from 'jose';

const JWT_SECRET = 'your-secret-key'; // In production, this should be an environment variable
const COOKIE_OPTIONS = {
  expires: 7, // Cookie expires in 7 days
  secure: true, // Only transmitted over HTTPS
  sameSite: 'strict' as const
};

// Convert string to Uint8Array for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

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

    const token = await new jose.SignJWT({ 
      playerId: data.id, 
      playerName: data.name 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secretKey);

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

    const token = await new jose.SignJWT({ 
      playerId: data.id, 
      playerName: data.name 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secretKey);

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
      jose.jwtVerify(token, secretKey);
      return true;
    } catch {
      return false;
    }
  },

  getLoggedInPlayerId() {
    const token = Cookies.get('auth_token');
    if (!token) return null;

    try {
      const decoded = jose.decodeJwt(token);
      return decoded.playerId as string;
    } catch {
      return null;
    }
  },

  logout() {
    Cookies.remove('auth_token');
  }
};