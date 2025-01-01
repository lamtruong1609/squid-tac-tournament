export interface GameTurn {
  board: string;
  winner: string | null;
}

export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface RPSRoundResult {
  winner: string | 'draw';
  choices: Record<string, RPSChoice>;
}

export interface RPSGameResult {
  status: 'in_progress' | 'completed' | 'rps_tiebreaker';
  winner?: string;
  currentRoundResult?: RPSRoundResult;
}