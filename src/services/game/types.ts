export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface GameTurn {
  board: string;
  winner: string | null;
}

export interface RPSRoundResult {
  winner: string | 'draw' | null;
  choices: {
    [key: string]: RPSChoice;
  };
}

export interface RPSGameResult {
  status: 'in_progress' | 'completed' | 'rps_tiebreaker';
  winner?: string | null;
  currentRoundResult: RPSRoundResult;
}