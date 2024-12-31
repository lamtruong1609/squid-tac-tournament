import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase-types'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type Game = Database['public']['Tables']['games']['Row']
type Player = Database['public']['Tables']['players']['Row']

interface JoinTournamentParams {
  playerName: string;
  telegramUrl: string | null;
  xUrl: string | null;
}

export const tournamentService = {
  async joinTournament({ playerName, telegramUrl, xUrl }: JoinTournamentParams) {
    // Create player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        name: playerName,
        telegram_url: telegramUrl,
        x_url: xUrl,
        wins: 0,
        losses: 0,
        draws: 0
      })
      .select()
      .single();

    if (playerError) throw playerError;

    // Find waiting tournament
    let { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select()
      .eq('status', 'waiting')
      .limit(1)
      .single();

    // If no waiting tournament exists, create one
    if (tournamentError) {
      const { data: newTournament, error: createError } = await supabase
        .from('tournaments')
        .insert({
          name: 'Tournament ' + new Date().toLocaleDateString(),
          max_players: 8,
          current_players: 0,
          status: 'waiting'
        })
        .select()
        .single();
        
      if (createError) throw createError;
      tournament = newTournament;
    }

    // Find waiting game
    let { data: game, error: gameError } = await supabase
      .from('games')
      .select()
      .eq('tournament_id', tournament.id)
      .eq('status', 'waiting')
      .limit(1)
      .single();

    // If no waiting game exists, create one
    if (gameError) {
      const { data: newGame, error: createGameError } = await supabase
        .from('games')
        .insert({
          tournament_id: tournament.id,
          player_x: player.id,
          board: JSON.stringify(Array(9).fill(null)),
          next_player: 'X',
          status: 'waiting'
        })
        .select()
        .single();
        
      if (createGameError) throw createGameError;
      game = newGame;
    }

    // If game already exists and needs player O
    if (game.status === 'waiting' && !game.player_o) {
      const { error: updateError } = await supabase
        .from('games')
        .update({
          player_o: player.id,
          status: 'in_progress'
        })
        .eq('id', game.id);

      if (updateError) throw updateError;
    }

    return {
      gameId: game.id,
      playerId: player.id
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
    const winner = this.calculateWinner(board);
    const isDraw = !winner && board.every((cell: string | null) => cell !== null);

    await supabase
      .from('games')
      .update({
        board: JSON.stringify(board),
        next_player: game.next_player === 'X' ? 'O' : 'X',
        winner: winner || (isDraw ? 'draw' : null),
        status: (winner || isDraw) ? 'completed' : 'in_progress'
      })
      .eq('id', gameId);
  },

  calculateWinner(board: (string | null)[]) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
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