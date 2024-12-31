import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import WaitingPlayers from '@/components/WaitingPlayers';

const Game = () => {
  const { gameId } = useParams();

  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
        console.error('Error fetching game:', error);
        throw error;
      }
      return data;
    },
  });

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['players', game?.player_x, game?.player_o],
    enabled: !!game,
    queryFn: async () => {
      const playerIds = [game.player_x, game.player_o].filter(Boolean);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .in('id', playerIds);

      if (error) {
        console.error('Error fetching players:', error);
        throw error;
      }
      return data;
    },
  });

  const isLoading = gameLoading || playersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading game...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Game not found. The game might have been completed or removed.</div>
      </div>
    );
  }

  if (game.status === 'waiting') {
    const playerNames = players?.map(p => p.name) || [];
    if (game.player_x && !playerNames.length) {
      playerNames.push('Loading player...');
    }
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8">Waiting for Players</h1>
        <WaitingPlayers players={playerNames} />
      </div>
    );
  }

  // TODO: Implement actual game board when status is 'in_progress'
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Game in progress</div>
    </div>
  );
};

export default Game;