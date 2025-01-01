import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { RPSChoice as RPSChoiceType, RPSRoundResult } from '@/services/game/types';
import RPSChoice from './rps/RPSChoice';
import RPSResult from './rps/RPSResult';

interface RPSGameProps {
  gameId: string;
  playerId: string;
  isMyTurn: boolean;
  opponent: any;
  onRPSChoice: (choice: RPSChoiceType) => Promise<{
    status: 'in_progress' | 'completed' | 'rps_tiebreaker';
    winner?: string;
    currentRoundResult?: RPSRoundResult;
  }>;
}

const RPSGame = ({ gameId, playerId, opponent, onRPSChoice }: RPSGameProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedChoice, setSelectedChoice] = useState<RPSChoiceType | null>(null);
  const [roundResult, setRoundResult] = useState<RPSRoundResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

  useEffect(() => {
    if (!selectedChoice && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
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

  const handleChoice = async (choice: RPSChoiceType) => {
    if (selectedChoice) return;
    
    try {
      setSelectedChoice(choice);
      setIsWaitingForOpponent(true);
      const result = await onRPSChoice(choice);
      
      if (result?.currentRoundResult) {
        setRoundResult(result.currentRoundResult);
        
        if (result.currentRoundResult.choices[opponent.id]) {
          setIsWaitingForOpponent(false);
        }
        
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
      setIsWaitingForOpponent(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make choice",
        variant: "destructive",
      });
    }
  };

  const choices: RPSChoiceType[] = ['rock', 'paper', 'scissors'];

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
        {choices.map((choice) => (
          <RPSChoice
            key={choice}
            choice={choice}
            selectedChoice={selectedChoice}
            onChoiceSelect={handleChoice}
          />
        ))}
      </div>

      {selectedChoice && (
        <RPSResult
          selectedChoice={selectedChoice}
          roundResult={roundResult}
          isWaitingForOpponent={isWaitingForOpponent}
          opponentId={opponent.id}
          playerId={playerId}
        />
      )}
    </motion.div>
  );
};

export default RPSGame;