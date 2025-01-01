export interface Tournament {
  id: string;
  name: string;
  status: 'waiting' | 'in_progress' | 'completed';
  max_players: number;
  current_players: number;
  current_round: number;
  winner?: string;
}

export interface Player {
  id: string;
  name: string;
  wins: number;
  losses: number;
}

export interface Match {
  id: string;
  tournament_id: string;
  player_x: string;
  player_o: string | null;
  winner: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
  round: number;
}