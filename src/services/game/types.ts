export interface GameTurn {
  board: string;
  winner: string | null;
}

export type RPSChoice = 'rock' | 'paper' | 'scissors';