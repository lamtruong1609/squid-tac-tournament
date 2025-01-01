import { supabase } from '@/lib/supabase';
import { updatePlayerStats } from '../playerStats';
import { RPSChoice, RPSGameResult } from './types';

const determineWinner = (
  p1Choice: RPSChoice,
  p2Choice: RPSChoice,
  player1Id: string,
  player2Id: string
): string | 'draw' => {
  if (p1Choice === p2Choice) return 'draw';
  
  const winningCombos: Record<RPSChoice, RPSChoice> = {
    rock: 'scissors',
    scissors: 'paper',
    paper: 'rock'
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

  const rpsHistory = game.rps_history ? JSON.parse(game.rps_history) : [];
  const currentRound = rpsHistory.length;

  // Add player's choice to history
  const currentRoundChoices = {
    ...(rpsHistory[currentRound] || {}),
    [playerId]: choice
  };
  rpsHistory[currentRound] = currentRoundChoices;

  // If both players have made their choice
  if (currentRoundChoices[game.player_x] && currentRoundChoices[game.player_o]) {
    const p1Choice = currentRoundChoices[game.player_x];
    const p2Choice = currentRoundChoices[game.player_o];
    
    const roundWinner = determineWinner(p1Choice, p2Choice, game.player_x, game.player_o);
    rpsHistory[currentRound].winner = roundWinner;

    // Count wins in RPS
    const p1Wins = rpsHistory.filter((r: any) => r.winner === game.player_x).length;
    const p2Wins = rpsHistory.filter((r: any) => r.winner === game.player_o).length;

    let gameStatus: 'rps_tiebreaker' | 'completed' | 'in_progress' = 'rps_tiebreaker';
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

  // If waiting for other player's choice
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
      winner: 'draw', // No winner yet since opponent hasn't chosen
      choices: currentRoundChoices
    }
  };
};