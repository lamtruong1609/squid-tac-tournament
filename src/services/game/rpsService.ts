import { supabase } from '@/lib/supabase';
import { calculateRPSWinner } from './gameUtils';
import { updatePlayerStats } from '../playerStats';
import { RPSChoice } from './types';

export const playRPS = async (
  gameId: string,
  playerId: string,
  choice: RPSChoice
) => {
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameError) throw gameError;

  if (game.status !== 'rps_tiebreaker') {
    throw new Error('Game is not in RPS tiebreaker mode');
  }

  // Parse existing RPS history or initialize new round
  const rpsHistory = game.rps_history ? JSON.parse(game.rps_history) : [];
  const currentRound = rpsHistory.length;
  
  // Get or create current round
  let currentRoundChoices = rpsHistory[currentRound] || {};
  
  // Add player's choice to current round
  currentRoundChoices[playerId] = choice;
  
  // Update the history with the current round
  rpsHistory[currentRound] = currentRoundChoices;

  // If both players have made their choice
  if (Object.keys(currentRoundChoices).length === 2) {
    const roundWinner = calculateRPSWinner(
      currentRoundChoices[game.player_x],
      currentRoundChoices[game.player_o],
      game.player_x,
      game.player_o
    );

    // Add winner to current round
    rpsHistory[currentRound].winner = roundWinner;

    // Count wins in RPS
    const p1Wins = rpsHistory.filter(r => r.winner === game.player_x).length;
    const p2Wins = rpsHistory.filter(r => r.winner === game.player_o).length;

    let gameStatus = 'rps_tiebreaker';
    let gameWinner = null;

    // Check if someone has won best of 3
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
};