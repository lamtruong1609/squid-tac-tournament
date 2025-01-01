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
    
    if (isWaitingForOpponent || !roundResult.choices[opponentId]) {
      return "Waiting for opponent's choice...";
    }
    
    if (roundResult.winner === 'draw') {
      return "It's a draw! Next round...";
    }

    const opponentChoice = roundResult.choices[opponentId];
    const resultMessage = roundResult.winner === playerId ? "You won this round!" : "Opponent won this round!";
    
    return `${resultMessage} (${selectedChoice} vs ${opponentChoice})`;
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
      {roundResult && (
        <>
          {!isWaitingForOpponent && roundResult.choices[opponentId] && (
            <div className="text-purple-400">
              Opponent chose {roundResult.choices[opponentId]}!
            </div>
          )}
          <div className="text-pink-400 font-bold text-2xl">
            {getResultMessage()}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default RPSResult;