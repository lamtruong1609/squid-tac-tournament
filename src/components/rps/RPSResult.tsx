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
    
    // Only show final result if we have a winner
    if (roundResult.winner) {
      if (roundResult.winner === playerId) {
        return `You won the tiebreaker! (${selectedChoice} beats ${opponentChoice})`;
      } else if (roundResult.winner === opponentId) {
        return `Opponent won the tiebreaker! (${opponentChoice} beats ${selectedChoice})`;
      } else if (roundResult.winner === 'draw') {
        return "It's a draw! Player X wins the tiebreaker!";
      }
    }
    
    // If no winner yet but both have chosen
    return "Calculating result...";
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