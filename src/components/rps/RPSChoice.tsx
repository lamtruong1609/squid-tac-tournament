import React from 'react';
import { Button } from '../ui/button';
import { Hand, Scroll, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';
import { RPSChoice as RPSChoiceType } from '@/services/game/types';

interface RPSChoiceProps {
  choice: RPSChoiceType;
  selectedChoice: RPSChoiceType | null;
  onChoiceSelect: (choice: RPSChoiceType) => void;
  disabled?: boolean;
}

const RPSChoice = ({ choice, selectedChoice, onChoiceSelect, disabled }: RPSChoiceProps) => {
  const icons = {
    rock: Hand,
    paper: Scroll,
    scissors: Scissors,
  };

  const Icon = icons[choice];

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <Button
        onClick={() => !disabled && !selectedChoice && onChoiceSelect(choice)}
        disabled={disabled || !!selectedChoice}
        className={`w-full h-32 ${
          selectedChoice === choice 
            ? 'bg-green-600 border-green-400'
            : disabled
              ? 'bg-gray-500 border-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
        } border-2 border-pink-400/50 shadow-lg shadow-pink-500/20`}
      >
        <div className="flex flex-col items-center gap-2">
          <Icon className="h-12 w-12" />
          <span className="text-lg font-bold">{choice.charAt(0).toUpperCase() + choice.slice(1)}</span>
        </div>
      </Button>
    </motion.div>
  );
};

export default RPSChoice;