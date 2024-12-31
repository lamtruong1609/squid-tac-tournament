import { Database } from "@/lib/supabase-types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

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

  const getPlayerStats = (playerId: string) => {
    const player = players?.find(p => p.id === playerId);
    if (!player) return { wins: 0, losses: 0, ratio: '0%' };
    const total = player.wins + player.losses;
    const ratio = total > 0 ? Math.round((player.wins / total) * 100) : 0;
    return { wins: player.wins, losses: player.losses, ratio: `${ratio}%` };
  };

  const playerXImage = "/lovable-uploads/d1b808b8-eee4-46ca-9eed-2716706fb7a0.png";
  const playerOImage = "/lovable-uploads/302a852d-9e1b-444e-817f-c4395f8e9379.png";

  return (
    <div className="text-center mb-12 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-xl" />
      <h1 className="text-6xl font-bold mb-4 relative">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          SQUID GAME
        </span>
      </h1>

      <div className="mb-8 relative">
        <Badge variant="outline" className="text-lg px-6 py-2">
          Turn {game.current_turn}/3
        </Badge>
      </div>
      
      <div className="flex gap-8 justify-center items-center relative">
        <div className={`p-4 rounded-lg ${game.next_player === 'X' ? 'neon-border bg-black/40' : 'bg-black/20'}`}>
          <Avatar className="w-20 h-20 mb-2 mx-auto border-2 border-primary">
            <AvatarImage src={playerXImage} alt="Player X" />
            <AvatarFallback>X</AvatarFallback>
          </Avatar>
          <div className="text-lg font-bold text-primary mb-1">
            {getPlayerName(game.player_x)}
          </div>
          <div className="text-sm text-muted-foreground">
            {(() => {
              const stats = getPlayerStats(game.player_x);
              return `${stats.wins}W ${stats.losses}L (${stats.ratio})`;
            })()}
          </div>
        </div>
        
        <div className="text-4xl font-bold text-white/80">VS</div>
        
        <div className={`p-4 rounded-lg ${game.next_player === 'O' ? 'neon-border bg-black/40' : 'bg-black/20'}`}>
          <Avatar className="w-20 h-20 mb-2 mx-auto border-2 border-accent">
            <AvatarImage src={playerOImage} alt="Player O" />
            <AvatarFallback>O</AvatarFallback>
          </Avatar>
          <div className="text-lg font-bold text-accent mb-1">
            {getPlayerName(game.player_o || '')}
          </div>
          <div className="text-sm text-muted-foreground">
            {(() => {
              const stats = getPlayerStats(game.player_o || '');
              return `${stats.wins}W ${stats.losses}L (${stats.ratio})`;
            })()}
          </div>
        </div>
      </div>
      
      {game.winner && (
        <div className="mt-8 text-2xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            {game.winner === 'draw' 
              ? "It's a draw!" 
              : `Winner: ${getPlayerName(game.winner)}`}
          </span>
        </div>
      )}
    </div>
  );
};