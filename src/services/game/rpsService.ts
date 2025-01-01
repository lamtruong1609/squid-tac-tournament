import { supabase } from '@/lib/supabase';
import { updatePlayerStats } from '../playerStats';
import { RPSChoice, RPSGameResult } from './types';

const determineWinner = (
  p1Choice: RPSChoice,
  p2Choice: RPSChoice,
  player1Id: string,
  player2Id: string
): string | 'draw' => {
  // If choices are the same, it's a draw
  if (p1Choice === p2Choice) {
    return 'draw';
  }

  // Define winning combinations
  const winningMoves = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };

  // Check if player 1's choice beats player 2's choice
  return winningMoves[p1Choice] === p2Choice ? player1Id : player2Id;
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

  // Parse existing RPS history or initialize new array
  const rpsHistory = game.rps_history ? JSON.parse(game.rps_history) : [];
  const currentRound = rpsHistory.length;

  // Get or initialize current round choices
  const currentRoundChoices = {
    ...(rpsHistory[currentRound] || {}),
    [playerId]: choice
  };

  // Update the current round with new choice
  rpsHistory[currentRound] = currentRoundChoices;

  // Check if both players have made their choices
  const bothPlayersChosen = currentRoundChoices[game.player_x] && currentRoundChoices[game.player_o];

  // Update game state with the new choice
  const { error: updateError } = await supabase
    .from('games')
    .update({
      rps_history: JSON.stringify(rpsHistory)
    })
    .eq('id', gameId);

  if (updateError) throw updateError;

  // If both players have chosen, determine the winner
  if (bothPlayersChosen) {
    const p1Choice = currentRoundChoices[game.player_x];
    const p2Choice = currentRoundChoices[game.player_o];
    
    const roundWinner = determineWinner(p1Choice, p2Choice, game.player_x, game.player_o);
    rpsHistory[currentRound].winner = roundWinner;

    // Count wins for each player
    const p1Wins = rpsHistory.filter((r: any) => r.winner === game.player_x).length;
    const p2Wins = rpsHistory.filter((r: any) => r.winner === game.player_o).length;

    let gameStatus: 'rps_tiebreaker' | 'completed' = 'rps_tiebreaker';
    let gameWinner = null;

    // Best of 3 rounds
    if (p1Wins >= 2) {
      gameStatus = 'completed';
      gameWinner = game.player_x;
    } else if (p2Wins >= 2) {
      gameStatus = 'completed';
      gameWinner = game.player_o;
    }

    // Update game state with round result
    const { error: finalUpdateError } = await supabase
      .from('games')
      .update({
        status: gameStatus,
        winner: gameWinner,
        rps_history: JSON.stringify(rpsHistory)
      })
      .eq('id', gameId);

    if (finalUpdateError) throw finalUpdateError;

    // Update player stats if game is completed
    if (gameStatus === 'completed' && gameWinner) {
      await updatePlayerStats(
        game.player_x,
        game.player_o,
        gameWinner === game.player_x ? 'win' : 'loss'
      );
    }

    return {
      status: gameStatus,
      winner: gameWinner,
      currentRoundResult: {
        winner: roundWinner,
        choices: currentRoundChoices
      }
    };
  }

  // Return in-progress status if waiting for opponent
  return {
    status: 'in_progress',
    currentRoundResult: {
      winner: null,
      choices: currentRoundChoices
    }
  };
};