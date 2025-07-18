import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface WaitingPlayersProps {
  players: Array<{
    id: string;
    name: string;
    isReady?: boolean;
  }>;
  gameId: string;
  currentPlayerId: string;
}

const WaitingPlayers = ({ players, gameId, currentPlayerId }: WaitingPlayersProps) => {
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

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
          const isPlayerXReady = newData.player_x_ready;
          const isPlayerOReady = newData.player_o_ready;
          
          if (isPlayerXReady && isPlayerOReady) {
            const { error: updateError } = await supabase
              .from('games')
              .update({ status: 'in_progress' })
              .eq('id', gameId);

            if (!updateError) {
              toast({
                title: "Game Starting!",
                description: "Both players are ready. The game will begin now.",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [gameId, toast]);

  const handleReadyStatus = async () => {
    try {
      const isPlayerX = currentPlayerId === players[0]?.id;
      const updateField = isPlayerX ? 'player_x_ready' : 'player_o_ready';

      const { error } = await supabase
        .from('games')
        .update({ [updateField]: !isReady })
        .eq('id', gameId);

      if (error) throw error;

      setIsReady(!isReady);
      toast({
        title: !isReady ? "You're ready to play!" : "Ready status removed",
        description: !isReady ? "Waiting for other player..." : "Please ready up when you're prepared to play",
      });
    } catch (error) {
      console.error('Error updating ready status:', error);
      toast({
        title: "Error",
        description: "Failed to update ready status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 p-4 bg-background/30 backdrop-blur-sm rounded-lg border border-primary/30 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-primary">
        Players Waiting: {players.length}
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded-md bg-secondary/50"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold">
                {index + 1}
              </span>
              <span className="text-foreground">{player.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {player.isReady ? (
                <span className="text-sm px-2 py-1 bg-green-500/20 text-green-500 rounded-full">
                  Ready
                </span>
              ) : (
                <span className="text-sm px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full">
                  Not Ready
                </span>
              )}
              {player.id === currentPlayerId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReadyStatus}
                  className={isReady ? "bg-red-500/20" : "bg-green-500/20"}
                >
                  {isReady ? "Cancel" : "Ready"}
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WaitingPlayers;