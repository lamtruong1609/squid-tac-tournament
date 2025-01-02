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
                // Update game state with current choices
                onGameStateUpdate(currentRound);

                // Check if both players have made their choices and game is completed
                const bothPlayersChosen = currentRound[playerId] && Object.keys(currentRound).find(key => 
                  key !== playerId && key !== 'winner' && currentRound[key]
                );

                if (newData.status === 'completed' && bothPlayersChosen) {
                  const opponentId = Object.keys(currentRound).find(key => 
                    key !== playerId && key !== 'winner'
                  );
                  
                  const isWinner = currentRound.winner === playerId;
                  const playerChoice = currentRound[playerId];
                  const opponentChoice = opponentId ? currentRound[opponentId] : '';

                  toast({
                    title: isWinner ? "You won the Final Tiebreaker!" : "Opponent won the Final Tiebreaker!",
                    description: `Final Result: ${playerChoice} vs ${opponentChoice}`,
                  });

                  // Navigate to winner/loser page after showing result
                  setTimeout(() => {
                    navigate(isWinner ? '/winner' : '/loser');
                  }, 5000);
                }
              }
            } catch (error) {
              console.error('Error parsing RPS history:', error);
              toast({
                title: "Error",
                description: "There was an error updating the game state",
                variant: "destructive",
              });
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