import { supabase } from '@/lib/supabase';
import { updatePlayerStats } from './playerStats';

interface GameTurn {
  board: string;
  winner: string | null;
}

export const gameService = {
  async makeMove(gameId: string, playerId: string, position: number, currentTurn: number) {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
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
    
    // Calculate winner for this turn
    const turnWinner = calculateWinner(board);
    const isDraw = !turnWinner && board.every((cell: string | null) => cell !== null);
    
    // Parse existing turns history
    const turnsHistory: GameTurn[] = game.turns_history ? JSON.parse(game.turns_history) : [];
    
    // Add current turn to history
    turnsHistory.push({
      board: JSON.stringify(board),
      winner: turnWinner ? (isPlayerX ? game.player_x : game.player_o) : (isDraw ? 'draw' : null)
    });

    // Calculate wins for each player
    const playerXWins = turnsHistory.filter(t => t.winner === game.player_x).length;
    const playerOWins = turnsHistory.filter(t => t.winner === game.player_o).length;
    
    let gameStatus = 'in_progress';
    let gameWinner = null;

    // Check if someone has won 2 turns
    if (playerXWins >= 2) {
      gameStatus = 'completed';
      gameWinner = game.player_x;
    } else if (playerOWins >= 2) {
      gameStatus = 'completed';
      gameWinner = game.player_o;
    } else if (turnsHistory.length >= 3 && playerXWins === playerOWins) {
      // If all 3 turns are played and it's a tie, start RPS
      gameStatus = 'rps_tiebreaker';
    }

    // Update game state
    const { error: updateError } = await supabase
      .from('games')
      .update({
        board: JSON.stringify(Array(9).fill(null)), // Reset board for next turn
        next_player: game.next_player === 'X' ? 'O' : 'X',
        winner: gameWinner,
        status: gameStatus,
        turns_history: JSON.stringify(turnsHistory),
        current_turn: currentTurn + 1
      })
      .eq('id', gameId);

    if (updateError) throw updateError;

    // If game is completed, update player stats
    if (gameStatus === 'completed') {
      await updatePlayerStats(
        game.player_x,
        game.player_o,
        gameWinner === game.player_x ? 'win' : 'loss'
      );
    }

    return {
      status: gameStatus,
      winner: gameWinner,
      turnsHistory
    };
  },

  async playRPS(gameId: string, playerId: string, choice: 'rock' | 'paper' | 'scissors') {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;

    if (game.status !== 'rps_tiebreaker') {
      throw new Error('Game is not in RPS tiebreaker mode');
    }

    const rpsHistory = game.rps_history ? JSON.parse(game.rps_history) : [];
    const currentRound = rpsHistory.length;

    // Add player's choice to history
    rpsHistory.push({
      [playerId]: choice
    });

    // If both players have made their choice
    if (Object.keys(rpsHistory[currentRound]).length === 2) {
      const p1Choice = rpsHistory[currentRound][game.player_x];
      const p2Choice = rpsHistory[currentRound][game.player_o];
      
      let roundWinner = null;
      
      if (p1Choice === p2Choice) {
        roundWinner = 'draw';
      } else if (
        (p1Choice === 'rock' && p2Choice === 'scissors') ||
        (p1Choice === 'paper' && p2Choice === 'rock') ||
        (p1Choice === 'scissors' && p2Choice === 'paper')
      ) {
        roundWinner = game.player_x;
      } else {
        roundWinner = game.player_o;
      }

      // Count wins in RPS
      const p1Wins = rpsHistory.filter(r => r.winner === game.player_x).length;
      const p2Wins = rpsHistory.filter(r => r.winner === game.player_o).length;

      let gameStatus = 'rps_tiebreaker';
      let gameWinner = null;

      if (p1Wins >= 2) {
        gameStatus = 'completed';
        gameWinner = game.player_x;
      } else if (p2Wins >= 2) {
        gameStatus = 'completed';
        gameWinner = game.player_o;
      }

      // Update game state
      const { error: updateError } = await supabase
        .from('games')
        .update({
          status: gameStatus,
          winner: gameWinner,
          rps_history: JSON.stringify(rpsHistory)
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      // If game is completed after RPS, update player stats
      if (gameStatus === 'completed') {
        await updatePlayerStats(
          game.player_x,
          game.player_o,
          gameWinner === game.player_x ? 'win' : 'loss'
        );
      }

      return {
        status: gameStatus,
        winner: gameWinner,
        rpsHistory
      };
    }

    // If waiting for other player's choice
    const { error: updateError } = await supabase
      .from('games')
      .update({
        rps_history: JSON.stringify(rpsHistory)
      })
      .eq('id', gameId);

    if (updateError) throw updateError;

    return {
      status: 'waiting_for_opponent',
      rpsHistory
    };
  }
};

function calculateWinner(board: (string | null)[]) {
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
}