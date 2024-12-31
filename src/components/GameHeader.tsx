import { Database } from "@/lib/supabase-types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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

  const playerXImage = "/lovable-uploads/d1b808b8-eee4-46ca-9eed-2716706fb7a0.png";
  const playerOImage = "/lovable-uploads/302a852d-9e1b-444e-817f-c4395f8e9379.png";

  return (
    <div className="text-center mb-12 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-xl" />
      <h1 className="text-6xl font-bold mb-8 relative">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          SQUID GAME
        </span>
      </h1>
      <div className="flex gap-8 justify-center items-center relative">
        <div className={`p-4 rounded-lg ${game.next_player === 'X' ? 'neon-border bg-black/40' : 'bg-black/20'}`}>
          <Avatar className="w-20 h-20 mb-2 mx-auto border-2 border-primary">
            <AvatarImage src={playerXImage} alt="Player X" />
            <AvatarFallback>X</AvatarFallback>
          </Avatar>
          <div className="text-lg font-bold text-primary">
            {getPlayerName(game.player_x)}
          </div>
        </div>
        
        <div className="text-4xl font-bold text-white/80">VS</div>
        
        <div className={`p-4 rounded-lg ${game.next_player === 'O' ? 'neon-border bg-black/40' : 'bg-black/20'}`}>
          <Avatar className="w-20 h-20 mb-2 mx-auto border-2 border-accent">
            <AvatarImage src={playerOImage} alt="Player O" />
            <AvatarFallback>O</AvatarFallback>
          </Avatar>
          <div className="text-lg font-bold text-accent">
            {getPlayerName(game.player_o || '')}
          </div>
        </div>
      </div>
      
      {game.winner && (
        <div className="mt-8 text-2xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            {game.winner === 'draw' ? "It's a draw!" : `Winner: ${getPlayerName(game.winner)}`}
          </span>
        </div>
      )}
    </div>
  );
};