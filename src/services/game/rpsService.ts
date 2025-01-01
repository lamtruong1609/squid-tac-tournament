import { supabase } from '@/lib/supabase';
import { updatePlayerStats } from '../playerStats';
import { RPSChoice, RPSGameResult } from './types';

const determineWinner = (
  p1Choice: RPSChoice,
  p2Choice: RPSChoice,
  player1Id: string,
  player2Id: string
): string | 'draw' => {
  if (p1Choice === p2Choice) {
    return 'draw';
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

  if (bothPlayersChosen) {
    const roundWinner = determineWinner(
      currentRoundChoices[game.player_x],
      currentRoundChoices[game.player_o],
      game.player_x,
      game.player_o
    );

    // Add winner to current round
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
    const { error: updateError } = await supabase
      .from('games')
      .update({
        status: gameStatus,
        winner: gameWinner,
        rps_history: JSON.stringify(rpsHistory)
      })
      .eq('id', gameId);

    if (updateError) throw updateError;

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

  // If not both players have chosen yet, just update the history
  const { error: updateError } = await supabase
    .from('games')
    .update({
      rps_history: JSON.stringify(rpsHistory)
    })
    .eq('id', gameId);

  if (updateError) throw updateError;

  return {
    status: 'in_progress',
    currentRoundResult: {
      winner: null,
      choices: currentRoundChoices
    }
  };
};