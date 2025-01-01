export type RPSChoice = 'rock' | 'paper' | 'scissors';

export type GameStatus = 'in_progress' | 'completed' | 'rps_tiebreaker';

export interface RPSRoundResult {
  winner: string | 'draw';
  choices: Record<string, RPSChoice>;
}

export interface GameTurn {
  board: string;
  winner: string | null;
}

export interface RPSGameResult {
  status: GameStatus;
  winner?: string;
  currentRoundResult?: RPSRoundResult;
}