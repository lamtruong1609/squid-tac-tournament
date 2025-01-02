import React from 'react';
import { motion } from 'framer-motion';
import { RPSRoundResult } from '@/services/game/types';

interface RPSResultProps {
  selectedChoice: string;
  roundResult: RPSRoundResult | null;
  isWaitingForOpponent: boolean;
  opponentId: string;
  playerId: string;
}

const RPSResult = ({ selectedChoice, roundResult, isWaitingForOpponent, opponentId, playerId }: RPSResultProps) => {
  const getResultMessage = () => {
    if (!roundResult) return null;
    
    // Show waiting message if opponent hasn't chosen yet
    if (!roundResult.choices[opponentId]) {
      return "Waiting for opponent's choice...";
    }
    
    // Both players have chosen - show the result
    const opponentChoice = roundResult.choices[opponentId];
    
    // Show final result when both players have chosen and there's a winner
    if (roundResult.choices[playerId] && roundResult.choices[opponentId]) {
      if (roundResult.winner === playerId) {
        return `You won the Final Tiebreaker! (${selectedChoice} beats ${opponentChoice})`;
      } else if (roundResult.winner === opponentId) {
        return `Opponent won the Final Tiebreaker! (${opponentChoice} beats ${selectedChoice})`;
      } else {
        return "Determining the winner...";
      }
    }
    
    return "Determining the winner...";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-xl text-center space-y-4 p-4 bg-black/20 rounded-lg backdrop-blur-sm"
    >
      <div className="text-green-400">
        You chose {selectedChoice}!
      </div>
      {roundResult && roundResult.choices[opponentId] && (
        <div className="text-purple-400">
          Opponent chose {roundResult.choices[opponentId]}!
        </div>
      )}
      <div className="text-pink-400 font-bold text-2xl">
        {getResultMessage()}
      </div>
    </motion.div>
  );
};

export default RPSResult;