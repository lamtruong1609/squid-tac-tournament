import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase-types'
import { calculateWinner } from './gameLogic'
import { updatePlayerStats } from './playerStats'
import { toast } from "sonner"

type Tournament = Database['public']['Tables']['tournaments']['Row']
type Game = Database['public']['Tables']['games']['Row']
type Player = Database['public']['Tables']['players']['Row']

interface JoinTournamentParams {
  playerName: string;
  password: string;
  tournamentId: string;
  telegramUrl: string | null;
  xUrl: string | null;
  avatarUrl: string;
}

export const tournamentService = {
  async joinTournament({ 
    playerName, 
    password, 
    tournamentId, 
    telegramUrl, 
    xUrl,
    avatarUrl 
  }: JoinTournamentParams) {
    // First check if tournament is full
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('current_players, max_players')
      .eq('id', tournamentId)
      .single();

    if (tournamentError) throw tournamentError;

    if (tournament.current_players >= tournament.max_players) {
      throw new Error('Tournament is full');
    }

    // Create or update player
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id, password')
      .eq('name', playerName)
      .single();

    let playerId;

    if (existingPlayer) {
      if (existingPlayer.password !== password) {
        throw new Error('Incorrect password');
      }
      playerId = existingPlayer.id;
      
      // Update existing player's avatar and social links
      await supabase
        .from('players')
        .update({
          telegram_url: telegramUrl,
          x_url: xUrl,
          avatar_url: avatarUrl
        })
        .eq('id', playerId);
    } else {
      const { data: newPlayer, error: playerError } = await supabase
        .from('players')
        .insert({
          name: playerName,
          password: password,
          telegram_url: telegramUrl,
          x_url: xUrl,
          avatar_url: avatarUrl,
          wins: 0,
          losses: 0,
          draws: 0
        })
        .select()
        .single();

      if (playerError) throw playerError;
      playerId = newPlayer.id;
    }

    // Increment current_players count
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({
        current_players: tournament.current_players + 1
      })
      .eq('id', tournamentId);

    if (updateError) throw updateError;

    // Find or create game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select()
      .eq('tournament_id', tournamentId)
      .eq('status', 'waiting')
      .is('player_o', null)
      .limit(1)
      .single();

    if (gameError) {
      // If no waiting game exists, create one
      const { data: newGame, error: createGameError } = await supabase
        .from('games')
        .insert({
          tournament_id: tournamentId,
          player_x: playerId,
          board: JSON.stringify(Array(9).fill(null)),
          next_player: 'X',
          status: 'waiting'
        })
        .select()
        .single();
        
      if (createGameError) throw createGameError;
      return {
        gameId: newGame.id,
        playerId
      };
    }

    // Join existing game as player O
    const { error: joinError } = await supabase
      .from('games')
      .update({
        player_o: playerId,
        status: 'in_progress'
      })
      .eq('id', game.id);

    if (joinError) throw joinError;

    return {
      gameId: game.id,
      playerId
    };
  },

  async makeMove(gameId: string, playerId: string, position: number) {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select()
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;

    if (game.status !== 'in_progress') {
      throw new Error('Game is not in progress');
    }

    const board = JSON.parse(game.board);
    if (board[position] !== null) {
      throw new Error('Invalid move');
    }

    const isPlayerX = game.player_x === playerId;
    const isPlayerO = game.player_o === playerId;

    if (!isPlayerX && !isPlayerO) {
      throw new Error('Not a player in this game');
    }

    if ((game.next_player === 'X' && !isPlayerX) || 
        (game.next_player === 'O' && !isPlayerO)) {
      throw new Error('Not your turn');
    }

    board[position] = game.next_player;
    const winner = calculateWinner(board);
    const isDraw = !winner && board.every((cell: string | null) => cell !== null);

    // Update game status
    const { error: updateError } = await supabase
      .from('games')
      .update({
        board: JSON.stringify(board),
        next_player: game.next_player === 'X' ? 'O' : 'X',
        winner: winner ? (isPlayerX ? game.player_x : game.player_o) : (isDraw ? 'draw' : null),
        status: (winner || isDraw) ? 'completed' : 'in_progress'
      })
      .eq('id', gameId);

    if (updateError) throw updateError;

    // If game is completed, update player stats
    if (winner || isDraw) {
      await updatePlayerStats(
        game.player_x,
        game.player_o,
        winner ? (isPlayerX ? 'win' : 'loss') : 'draw'
      );
    }
  },

  async subscribeToGame(gameId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        callback
      )
      .subscribe();
  }
};