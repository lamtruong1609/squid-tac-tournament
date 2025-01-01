import React from 'react';
import { Button } from './ui/button';
import { Hand, Scroll, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface RPSGameProps {
  gameId: string;
  playerId: string;
  isMyTurn: boolean;
  opponent: any;
  onRPSChoice: (choice: 'rock' | 'paper' | 'scissors') => Promise<void>;
}

const RPSGame = ({ gameId, playerId, isMyTurn, opponent, onRPSChoice }: RPSGameProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChoice = async (choice: 'rock' | 'paper' | 'scissors') => {
    try {
      await onRPSChoice(choice);
      toast({
        title: "Choice made!",
        description: "Waiting for opponent's choice...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make choice",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center gap-8 p-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl backdrop-blur-lg border border-pink-500/30"
    >
      <motion.h3 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold text-pink-500 text-center"
      >
        🦑 Squid Game: Final Round 🦑
      </motion.h3>
      
      <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => handleChoice('rock')}
            disabled={!isMyTurn}
            className="w-full h-32 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-2 border-pink-400/50 shadow-lg shadow-pink-500/20"
          >
            <div className="flex flex-col items-center gap-2">
              <Hand className="h-12 w-12" />
              <span className="text-lg font-bold">Rock</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => handleChoice('paper')}
            disabled={!isMyTurn}
            className="w-full h-32 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-2 border-pink-400/50 shadow-lg shadow-pink-500/20"
          >
            <div className="flex flex-col items-center gap-2">
              <Scroll className="h-12 w-12" />
              <span className="text-lg font-bold">Paper</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => handleChoice('scissors')}
            disabled={!isMyTurn}
            className="w-full h-32 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-2 border-pink-400/50 shadow-lg shadow-pink-500/20"
          >
            <div className="flex flex-col items-center gap-2">
              <Scissors className="h-12 w-12" />
              <span className="text-lg font-bold">Scissors</span>
            </div>
          </Button>
        </motion.div>
      </div>

      {!isMyTurn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-pink-400 mt-4"
        >
          Waiting for opponent's choice...
        </motion.div>
      )}
    </motion.div>
  );
};

export default RPSGame;