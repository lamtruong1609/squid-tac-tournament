import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import WaitingPlayers from '@/components/WaitingPlayers';

const Game = () => {
  const { gameId } = useParams();

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          player_x_details:players!player_x(name),
          player_o_details:players!player_o(name)
        `)
        .eq('id', gameId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading game...</div>;
  }

  if (!game) {
    return <div>Game not found</div>;
  }

  if (game.status === 'waiting') {
    const players = [game.player_x_details.name];
    if (game.player_o_details?.name) {
      players.push(game.player_o_details.name);
    }
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8">Waiting for Players</h1>
        <WaitingPlayers players={players} />
      </div>
    );
  }

  // TODO: Implement actual game board when status is 'in_progress'
  return (
    <div>Game in progress</div>
  );
};

export default Game;