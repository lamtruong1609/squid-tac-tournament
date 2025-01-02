import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from 'lucide-react';

interface GameStatsProps {
  currentTurn: number;
  turnsHistory: any[];
  currentPlayer: any;
  opponent: any;
  playerId: string;
}

export const GameStats = ({ currentTurn, turnsHistory, currentPlayer, opponent, playerId }: GameStatsProps) => {
  const getPlayerStats = (player: any) => {
    if (!player) return { wins: 0, losses: 0, draws: 0, ratio: '0%' };
    const total = player.wins + player.losses;
    const ratio = total > 0 ? Math.round((player.wins / total) * 100) : 0;
    return {
      wins: player.wins,
      losses: player.losses,
      draws: player.draws,
      ratio: `${ratio}%`
    };
  };

  return (
    <div className="flex items-center justify-between">
      <Badge variant="outline" className="text-lg">
        Match {currentTurn}/3
      </Badge>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {turnsHistory.map((turn, index) => (
            <Badge 
              key={index} 
              variant={turn.winner === playerId ? "default" : turn.winner === 'draw' ? "secondary" : "destructive"}
            >
              {turn.winner === playerId 
                ? `Won (${currentPlayer?.name})` 
                : turn.winner === 'draw' 
                  ? 'Draw' 
                  : `Lost (${opponent?.name})`}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentPlayer?.avatar} alt={currentPlayer?.name} />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium">{currentPlayer?.name}</div>
            <div className="text-xs text-muted-foreground">
              {getPlayerStats(currentPlayer).wins}W {getPlayerStats(currentPlayer).losses}L ({getPlayerStats(currentPlayer).ratio})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};