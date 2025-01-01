export interface GameTurn {
  board: string;
  winner: string | null;
}

export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface GameState {
  status: string;
  winner: string | null;
  turnsHistory: GameTurn[];
}