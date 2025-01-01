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

  // Poll game status every 3 seconds with retry logic
  const { data: game, isLoading: gameLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      try {
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
            .update({ 
              status: 'in_progress',
              turns_history: '[]'
            })
            .eq('id', gameId);

          if (!updateError) {
            toast({
              title: "Game Starting!",
              description: "Both players are ready. The game will begin now.",
            });
            return { ...data, status: 'in_progress', turns_history: '[]' };
          }
        }
        return data;
      } catch (error) {
        console.error('Network error:', error);
        toast({
          title: "Connection Error",
          description: "Having trouble connecting to the game. Retrying...",
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 3000,
    retry: 3,
    retryDelay: 1000,
  });

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['players', game?.player_x, game?.player_o],
    enabled: !!game,
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error('Network error fetching players:', error);
        toast({
          title: "Connection Error",
          description: "Having trouble loading player data. Retrying...",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setCurrentPlayerId(storedPlayerId);
    }
  }, []);

  // Show loading state during initial load or retries
  if (gameLoading || playersLoading) {
    return <GameStatus status="loading" />;
  }

  // Show error state if all retries failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-destructive text-center space-y-4">
          <p>Unable to connect to the game.</p>
          <p className="text-sm text-muted-foreground">Please check your internet connection and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return <GameStatus status="not-found" />;
  }

  // Safely parse board with fallback to empty board
  const board = (() => {
    try {
      return game.board ? JSON.parse(game.board) : Array(9).fill(null);
    } catch (e) {
      console.error('Error parsing game board:', e);
      return Array(9).fill(null);
    }
  })();

  // Safely parse turns history with fallback to empty array
  const turnsHistory = (() => {
    try {
      const historyStr = game.turns_history || '[]';
      console.log('Raw turns_history:', historyStr);
      return JSON.parse(historyStr);
    } catch (e) {
      console.error('Error parsing turns history:', e);
      return [];
    }
  })();

  const isMyTurn = (
    (currentPlayerId === game.player_x && game.next_player === 'X') ||
    (currentPlayerId === game.player_o && game.next_player === 'O')
  );

  const currentPlayerSymbol = currentPlayerId === game.player_x ? 'X' : 'O';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <GameHeader 
        game={game}
        players={players || []}
        currentPlayerId={currentPlayerId || ''}
      />

      {(game.status === 'waiting' || !game.player_o) ? (
        <WaitingPlayers 
          players={players?.map(p => ({
            id: p.id,
            name: p.name,
            isReady: p.id === game.player_x ? game.player_x_ready : game.player_o_ready
          })) || []}
          gameId={game.id}
          currentPlayerId={currentPlayerId || ''}
        />
      ) : (
        <GameBoard
          gameId={game.id}
          playerId={currentPlayerId || ''}
          board={board}
          isMyTurn={isMyTurn}
          currentTurn={game.current_turn || 1}
          gameStatus={game.status}
          turnsHistory={turnsHistory}
          players={players || []}
          currentPlayerSymbol={currentPlayerSymbol}
        />
      )}
    </div>
  );
};

export default Game;