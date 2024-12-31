import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import WaitingPlayers from '@/components/WaitingPlayers';
import GameBoard from '@/components/GameBoard';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Game = () => {
  const { gameId } = useParams();
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    if (gameId) {
      const subscription = supabase
        .channel(`game:${gameId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'games',
            filter: `id=eq.${gameId}`,
          },
          (payload) => {
            console.log('Game updated:', payload);
            const newData = payload.new as any;

            // Handle game status changes
            if (newData.status === 'in_progress' && game?.status === 'waiting') {
              toast({
                title: "Game Started!",
                description: "Both players are ready. The game has begun.",
              });
            }

            // Handle game moves
            if (newData.board !== game?.board) {
              const currentBoard = JSON.parse(game?.board || '[]');
              const newBoard = JSON.parse(newData.board);
              
              // Find the position that changed
              const movePosition = newBoard.findIndex((cell: string | null, index: number) => 
                cell !== currentBoard[index]
              );

              if (movePosition !== -1) {
                toast({
                  title: "New Move",
                  description: `Player placed ${newBoard[movePosition]} at position ${movePosition + 1}`,
                });
              }
            }

            // Handle game completion
            if (newData.winner && !game?.winner) {
              const winnerMessage = newData.winner === 'draw' 
                ? "Game ended in a draw!"
                : `Player ${newData.winner === game?.player_x ? 'X' : 'O'} won!`;
              
              toast({
                title: "Game Over",
                description: winnerMessage,
              });
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [gameId, game, toast]);

  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setCurrentPlayerId(storedPlayerId);
    }
  }, []);

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

  const bothPlayersReady = game.player_x_ready && game.player_o_ready;
  const gameCanStart = game.status === 'waiting' && bothPlayersReady;

  if (game.status === 'waiting' || !gameCanStart) {
    const playersList = players?.map(p => ({
      id: p.id,
      name: p.name,
      isReady: p.id === game.player_x ? game.player_x_ready : game.player_o_ready
    })) || [];
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8">Waiting for Players</h1>
        <WaitingPlayers 
          players={playersList}
          gameId={game.id}
          currentPlayerId={currentPlayerId || ''}
        />
      </div>
    );
  }

  const board = JSON.parse(game.board);
  const isMyTurn = (
    (currentPlayerId === game.player_x && game.next_player === 'X') ||
    (currentPlayerId === game.player_o && game.next_player === 'O')
  );

  const getPlayerName = (playerId: string) => {
    const player = players?.find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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

      {currentPlayerId && (
        <GameBoard
          gameId={game.id}
          playerId={currentPlayerId}
          board={board}
          isMyTurn={isMyTurn}
        />
      )}
    </div>
  );
};

export default Game;