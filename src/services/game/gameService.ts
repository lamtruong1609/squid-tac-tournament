import { supabase } from '@/lib/supabase';
import { updatePlayerStats } from '../playerStats';
import { calculateWinner } from './gameUtils';
import { GameTurn } from './types';
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

    const board = JSON.parse(game.board || '[]');
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
    
    // Parse existing turns history with safe fallback
    const turnsHistory: GameTurn[] = (() => {
      try {
        return game.turns_history ? JSON.parse(game.turns_history) : [];
      } catch (e) {
        console.error('Error parsing turns history in makeMove:', e);
        return [];
      }
    })();
    
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
    } else if (currentTurn >= 3 && playerXWins === playerOWins) {
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

  playRPS
};