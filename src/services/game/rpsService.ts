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
  // Get current game state
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameError) throw gameError;

  if (game.status !== 'rps_tiebreaker') {
    throw new Error('Game is not in RPS tiebreaker mode');
  }

  // Parse existing choices
  const currentChoices = game.rps_history ? JSON.parse(game.rps_history) : {};
  
  // Check if player has already made a choice
  if (currentChoices[playerId]) {
    throw new Error('Player has already made a choice');
  }

  // Add new choice
  currentChoices[playerId] = choice;

  // Check if both players have made their choices
  const otherPlayerId = playerId === game.player_x ? game.player_o : game.player_x;
  const bothPlayersChosen = currentChoices[game.player_x] && currentChoices[game.player_o];

  let updateData: any = {
    rps_history: JSON.stringify(currentChoices)
  };

  if (bothPlayersChosen) {
    // Determine winner
    const winner = determineWinner(
      currentChoices[game.player_x],
      currentChoices[game.player_o],
      game.player_x,
      game.player_o
    );

    // Update game with winner
    updateData = {
      ...updateData,
      status: 'completed',
      winner
    };

    // Update game state with final result
    const { error: updateError } = await supabase
      .from('games')
      .update(updateData)
      .eq('id', gameId);

    if (updateError) throw updateError;

    // Update player stats
    await updatePlayerStats(
      game.player_x,
      game.player_o,
      winner === game.player_x ? 'win' : 'loss'
    );

    return {
      status: 'completed',
      winner,
      currentRoundResult: {
        winner,
        choices: currentChoices
      }
    };
  }

  // If waiting for other player's choice
  const { error: updateError } = await supabase
    .from('games')
    .update(updateData)
    .eq('id', gameId);

  if (updateError) throw updateError;

  return {
    status: 'in_progress',
    currentRoundResult: {
      winner: null,
      choices: currentChoices
    }
  };
};