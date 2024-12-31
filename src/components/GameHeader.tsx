import { Database } from "@/lib/supabase-types";

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

interface GameHeaderProps {
  game: Game;
  players: Player[];
  currentPlayerId: string;
}

export const GameHeader = ({ game, players, currentPlayerId }: GameHeaderProps) => {
  const getPlayerName = (playerId: string) => {
    const player = players?.find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-4">Tic Tac Toe</h1>
      <div className="flex gap-4 justify-center items-center">
        <div className={`px-4 py-2 rounded ${game.next_player === 'X' ? 'bg-primary text-white' : 'bg-secondary'}`}>
          X: {getPlayerName(game.player_x)}
        </div>
        <div>vs</div>
        <div className={`px-4 py-2 rounded ${game.next_player === 'O' ? 'bg-primary text-white' : 'bg-secondary'}`}>
          O: {getPlayerName(game.player_o || '')}
        </div>
      </div>
      {game.winner && (
        <div className="mt-4 text-xl font-bold text-primary">
          Winner: {game.winner === 'draw' ? "It's a draw!" : getPlayerName(game.winner)}
        </div>
      )}
    </div>
  );
};