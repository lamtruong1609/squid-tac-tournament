import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import WaitingPlayers from '@/components/WaitingPlayers';
import GameBoard from '@/components/GameBoard';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { GameStatus } from '@/components/GameStatus';
import { GameHeader } from '@/components/GameHeader';

const Game = () => {
  const { gameId } = useParams();
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Poll game status every 3 seconds
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

      // If both players are ready and game is in waiting status, start the game
      if (data.player_x_ready && data.player_o_ready && data.status === 'waiting') {
        const { error: updateError } = await supabase
          .from('games')
          .update({ status: 'in_progress' })
          .eq('id', gameId);

        if (!updateError) {
          toast({
            title: "Game Starting!",
            description: "Both players are ready. The game will begin now.",
          });
          return { ...data, status: 'in_progress' };
        }
      }
      return data;
    },
    refetchInterval: 3000, // Poll every 3 seconds
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

  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setCurrentPlayerId(storedPlayerId);
    }
  }, []);

  // Handle winner/loser redirection
  useEffect(() => {
    if (game?.status === 'completed' && currentPlayerId) {
      if (game.winner === 'draw') {
        toast({
          title: "It's a Draw!",
          description: "Good game!",
        });
      } else if (game.winner === currentPlayerId) {
        toast({
          title: "Congratulations!",
          description: "You've won the game!",
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: "Don't give up!",
        });
      }
      navigate('/');
    }
  }, [game?.status, game?.winner, currentPlayerId, navigate, toast]);

  const isLoading = gameLoading || playersLoading;

  if (isLoading) {
    return <GameStatus status="loading" />;
  }

  if (!game) {
    return <GameStatus status="not-found" />;
  }

  const board = JSON.parse(game.board);
  const isMyTurn = (
    (currentPlayerId === game.player_x && game.next_player === 'X') ||
    (currentPlayerId === game.player_o && game.next_player === 'O')
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <GameHeader 
        game={game}
        players={players || []}
        currentPlayerId={currentPlayerId || ''}
      />

      {(game.status === 'waiting' || !game.player_o) && (
        <WaitingPlayers 
          players={players?.map(p => ({
            id: p.id,
            name: p.name,
            isReady: p.id === game.player_x ? game.player_x_ready : game.player_o_ready
          })) || []}
          gameId={game.id}
          currentPlayerId={currentPlayerId || ''}
        />
      )}

      {game.status === 'in_progress' && currentPlayerId && (
        <GameBoard
          gameId={game.id}
          playerId={currentPlayerId}
          board={board}
          isMyTurn={isMyTurn}
          currentTurn={game.current_turn || 1}
          gameStatus={game.status}
          turnsHistory={JSON.parse(game.turns_history || '[]')}
        />
      )}
    </div>
  );
};

export default Game;