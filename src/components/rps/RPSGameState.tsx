import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface RPSGameStateProps {
  gameId: string;
  playerId: string;
  onGameStateUpdate: (gameState: any) => void;
}

export const RPSGameState = ({ gameId, playerId, onGameStateUpdate }: RPSGameStateProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
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
        async (payload) => {
          const newData = payload.new as any;
          
          if (newData.rps_history) {
            try {
              const rpsHistory = JSON.parse(newData.rps_history);
              const currentRound = rpsHistory[rpsHistory.length - 1];
              
              if (currentRound) {
                onGameStateUpdate(currentRound);

                if (newData.status === 'completed') {
                  const isWinner = newData.winner === playerId;
                  
                  toast({
                    title: isWinner ? "You won!" : "Opponent won!",
                    description: "Game Over!",
                  });
                  
                  setTimeout(() => {
                    navigate(isWinner ? '/winner' : '/loser');
                  }, 1500);
                }
              }
            } catch (error) {
              console.error('Error parsing RPS history:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId, playerId, navigate, toast, onGameStateUpdate]);

  return null;
};