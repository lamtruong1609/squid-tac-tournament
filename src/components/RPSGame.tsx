import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Hand, Scroll, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { RPSChoice, RPSRoundResult } from '@/services/game/types';

interface RPSGameProps {
  gameId: string;
  playerId: string;
  isMyTurn: boolean;
  opponent: any;
  onRPSChoice: (choice: RPSChoice) => Promise<{
    status: 'in_progress' | 'completed' | 'rps_tiebreaker';
    winner?: string;
    currentRoundResult?: RPSRoundResult;
  }>;
}

const RPSGame = ({ gameId, playerId, opponent, onRPSChoice }: RPSGameProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedChoice, setSelectedChoice] = useState<RPSChoice | null>(null);
  const [roundResult, setRoundResult] = useState<RPSRoundResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!selectedChoice && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto-select rock if time runs out
            handleChoice('rock');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [selectedChoice, timeLeft]);

  const handleChoice = async (choice: RPSChoice) => {
    try {
      setSelectedChoice(choice);
      const result = await onRPSChoice(choice);
      
      if (result?.currentRoundResult) {
        setRoundResult(result.currentRoundResult);
        
        if (result.status === 'completed') {
          toast({
            title: result.winner === playerId ? "You won!" : "Opponent won!",
            description: "Game Over!",
          });
          
          setTimeout(() => {
            navigate(result.winner === playerId ? '/winner' : '/loser');
          }, 1500);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make choice",
        variant: "destructive",
      });
    }
  };

  const getResultMessage = () => {
    if (!roundResult) return null;
    
    if (roundResult.winner === 'draw') {
      return "It's a draw! Next round...";
    }
    return roundResult.winner === playerId ? "You won this round!" : "Opponent won this round!";
  };

  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center gap-8 p-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl backdrop-blur-lg border border-pink-500/30"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center gap-2"
      >
        <h3 className="text-3xl font-bold text-pink-500 text-center">
          🦑 Squid Game: Final Round 🦑
        </h3>
        {!selectedChoice && (
          <div className="text-2xl font-bold text-yellow-500">
            Time left: {timeLeft}s
          </div>
        )}
      </motion.div>
      
      <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
        <motion.div
          whileHover={{ scale: selectedChoice ? 1 : 1.05 }}
          whileTap={{ scale: selectedChoice ? 1 : 0.95 }}
        >
          <Button
            onClick={() => !selectedChoice && handleChoice('rock')}
            disabled={!!selectedChoice}
            className={`w-full h-32 ${
              selectedChoice === 'rock' 
                ? 'bg-green-600 border-green-400'
                : 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            } border-2 border-pink-400/50 shadow-lg shadow-pink-500/20`}
          >
            <div className="flex flex-col items-center gap-2">
              <Hand className="h-12 w-12" />
              <span className="text-lg font-bold">Rock</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: selectedChoice ? 1 : 1.05 }}
          whileTap={{ scale: selectedChoice ? 1 : 0.95 }}
        >
          <Button
            onClick={() => !selectedChoice && handleChoice('paper')}
            disabled={!!selectedChoice}
            className={`w-full h-32 ${
              selectedChoice === 'paper'
                ? 'bg-green-600 border-green-400'
                : 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            } border-2 border-pink-400/50 shadow-lg shadow-pink-500/20`}
          >
            <div className="flex flex-col items-center gap-2">
              <Scroll className="h-12 w-12" />
              <span className="text-lg font-bold">Paper</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: selectedChoice ? 1 : 1.05 }}
          whileTap={{ scale: selectedChoice ? 1 : 0.95 }}
        >
          <Button
            onClick={() => !selectedChoice && handleChoice('scissors')}
            disabled={!!selectedChoice}
            className={`w-full h-32 ${
              selectedChoice === 'scissors'
                ? 'bg-green-600 border-green-400'
                : 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            } border-2 border-pink-400/50 shadow-lg shadow-pink-500/20`}
          >
            <div className="flex flex-col items-center gap-2">
              <Scissors className="h-12 w-12" />
              <span className="text-lg font-bold">Scissors</span>
            </div>
          </Button>
        </motion.div>
      </div>

      {selectedChoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl text-center space-y-2"
        >
          <div className="text-green-400">
            You chose {selectedChoice}!
          </div>
          {roundResult && (
            <>
              <div className="text-purple-400">
                Opponent chose {roundResult.choices[opponent.id]}!
              </div>
              <div className="text-pink-400 font-bold text-2xl">
                {getResultMessage()}
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default RPSGame;