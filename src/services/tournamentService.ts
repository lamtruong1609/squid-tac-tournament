import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase-types'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type Game = Database['public']['Tables']['games']['Row']
type Player = Database['public']['Tables']['players']['Row']

export const tournamentService = {
  async createTournament(name: string, maxPlayers: number = 8) {
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name,
        max_players: maxPlayers,
        current_players: 0,
        status: 'waiting'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async joinTournament(tournamentId: string, player: Player) {
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select()
      .eq('id', tournamentId)
      .single()

    if (tournamentError) throw tournamentError

    if (tournament.current_players >= tournament.max_players) {
      throw new Error('Tournament is full')
    }

    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ current_players: tournament.current_players + 1 })
      .eq('id', tournamentId)

    if (updateError) throw updateError

    // Create a new game if we have an even number of players
    if ((tournament.current_players + 1) % 2 === 0) {
      const { data: waitingGame } = await supabase
        .from('games')
        .select()
        .eq('tournament_id', tournamentId)
        .eq('status', 'waiting')
        .single()

      if (waitingGame) {
        await supabase
          .from('games')
          .update({
            player_o: player.id,
            status: 'in_progress'
          })
          .eq('id', waitingGame.id)
      } else {
        await supabase
          .from('games')
          .insert({
            tournament_id: tournamentId,
            player_x: player.id,
            board: JSON.stringify(Array(9).fill(null)),
            status: 'waiting'
          })
      }
    }
  },

  async makeMove(gameId: string, playerId: string, position: number) {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select()
      .eq('id', gameId)
      .single()

    if (gameError) throw gameError

    if (game.status !== 'in_progress') {
      throw new Error('Game is not in progress')
    }

    const board = JSON.parse(game.board)
    if (board[position] !== null) {
      throw new Error('Invalid move')
    }

    const isPlayerX = game.player_x === playerId
    const isPlayerO = game.player_o === playerId

    if (!isPlayerX && !isPlayerO) {
      throw new Error('Not a player in this game')
    }

    if ((game.next_player === 'X' && !isPlayerX) || 
        (game.next_player === 'O' && !isPlayerO)) {
      throw new Error('Not your turn')
    }

    board[position] = game.next_player
    const winner = this.calculateWinner(board)
    const isDraw = !winner && board.every((cell: string | null) => cell !== null)

    await supabase
      .from('games')
      .update({
        board: JSON.stringify(board),
        next_player: game.next_player === 'X' ? 'O' : 'X',
        winner: winner || (isDraw ? 'draw' : null),
        status: (winner || isDraw) ? 'completed' : 'in_progress'
      })
      .eq('id', gameId)
  },

  calculateWinner(board: (string | null)[]) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ]

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
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
      .subscribe()
  }
}