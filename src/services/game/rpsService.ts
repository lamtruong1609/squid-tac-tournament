import { supabase } from '@/lib/supabase';
import { updatePlayerStats } from '../playerStats';
import { RPSChoice, RPSGameResult } from './types';

const determineWinner = (
  p1Choice: RPSChoice,
  p2Choice: RPSChoice,
  player1Id: string,
  player2Id: string
): string => {
  if (p1Choice === p2Choice) {
    return player1Id; // In case of tie, player X (player1) wins
  }

  const winningCombos: Record<RPSChoice, RPSChoice> = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };

  return winningCombos[p1Choice] === p2Choice ? player1Id : player2Id;
};

export const playRPS = async (
  gameId: string,
  playerId: string,
  choice: RPSChoice
): Promise<RPSGameResult> => {
  // First, get the current game state
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameError) throw gameError;

  if (game.status !== 'rps_tiebreaker') {
    throw new Error('Game is not in RPS tiebreaker mode');
  }

  // Parse existing RPS history or initialize new array
  const rpsHistory = game.rps_history ? JSON.parse(game.rps_history) : [];
  
  // Check if player has already made a choice in this game
  const hasPlayerChosen = rpsHistory.some((round: any) => round[playerId]);
  if (hasPlayerChosen) {
    throw new Error('Player has already made a choice in this game');
  }

  // Add new choice
  const currentRound = {
    ...(rpsHistory[0] || {}),
    [playerId]: choice
  };
  rpsHistory[0] = currentRound;

  // Check if both players have made their choices
  const otherPlayerId = playerId === game.player_x ? game.player_o : game.player_x;
  const bothPlayersChosen = currentRound[game.player_x] && currentRound[game.player_o];

  let updateData: any = {
    rps_history: JSON.stringify(rpsHistory)
  };

  if (bothPlayersChosen) {
    // Determine winner
    const winner = determineWinner(
      currentRound[game.player_x],
      currentRound[game.player_o],
      game.player_x,
      game.player_o
    );

    // Update game with winner
    updateData = {
      ...updateData,
      status: 'completed',
      winner: winner
    };

    // Add winner to current round
    currentRound.winner = winner;
    rpsHistory[0] = currentRound;
    updateData.rps_history = JSON.stringify(rpsHistory);
  }

  // Update game state
  const { error: updateError } = await supabase
    .from('games')
    .update(updateData)
    .eq('id', gameId);

  if (updateError) throw updateError;

  // If game completed, update player stats
  if (bothPlayersChosen) {
    await updatePlayerStats(
      game.player_x,
      game.player_o,
      updateData.winner === game.player_x ? 'win' : 'loss'
    );
  }

  return {
    status: bothPlayersChosen ? 'completed' : 'in_progress',
    winner: bothPlayersChosen ? updateData.winner : null,
    currentRoundResult: {
      winner: bothPlayersChosen ? updateData.winner : null,
      choices: currentRound
    }
  };
};