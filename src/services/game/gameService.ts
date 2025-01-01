import { supabase } from '@/lib/supabase';
import { updatePlayerStats } from '../playerStats';
import { calculateWinner } from './gameUtils';
import { GameTurn, RPSChoice, RPSGameResult } from './types';
import { playRPS } from './rpsService';

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

    // Parse the current board state
    let board: (string | null)[];
    try {
      board = JSON.parse(game.board || '[]');
    } catch {
      board = Array(9).fill(null);
    }

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

    // Make the move
    board[position] = game.next_player;
    
    // Calculate winner for this board
    const turnWinner = calculateWinner(board);
    const isDraw = !turnWinner && board.every(cell => cell !== null);
    
    // Parse existing turns history
    const turnsHistory: GameTurn[] = (() => {
      try {
        return game.turns_history ? JSON.parse(game.turns_history) : [];
      } catch {
        console.error('Error parsing turns history, defaulting to empty array');
        return [];
      }
    })();

    let gameStatus = game.status;
    let gameWinner = null;
    let nextBoard = board;
    let nextTurn = currentTurn;

    // If there's a winner or it's a draw, complete this turn
    if (turnWinner || isDraw) {
      // Add completed turn to history
      turnsHistory.push({
        board: JSON.stringify(board),
        winner: turnWinner ? (isPlayerX ? game.player_x : game.player_o) : (isDraw ? 'draw' : null)
      });

      // Calculate wins for each player
      const playerXWins = turnsHistory.filter(t => t.winner === game.player_x).length;
      const playerOWins = turnsHistory.filter(t => t.winner === game.player_o).length;

      // Check if game should end or continue to next turn
      if (playerXWins >= 2) {
        gameStatus = 'completed';
        gameWinner = game.player_x;
      } else if (playerOWins >= 2) {
        gameStatus = 'completed';
        gameWinner = game.player_o;
      } else if (turnsHistory.length >= 3 && playerXWins === playerOWins) {
        gameStatus = 'rps_tiebreaker';
      } else {
        // Start new turn with empty board
        nextBoard = Array(9).fill(null);
        nextTurn = currentTurn + 1;
      }
    }

    // Update game state
    const { error: updateError } = await supabase
      .from('games')
      .update({
        board: JSON.stringify(nextBoard),
        next_player: game.next_player === 'X' ? 'O' : 'X',
        winner: gameWinner,
        status: gameStatus,
        turns_history: JSON.stringify(turnsHistory),
        current_turn: nextTurn
      })
      .eq('id', gameId);

    if (updateError) throw updateError;

    // Update player stats if game completed
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

  playRPS
};
