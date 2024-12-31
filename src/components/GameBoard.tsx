import React from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { tournamentService } from '@/services/tournamentService';

interface GameBoardProps {
  gameId: string;
  playerId: string;
  board: (string | null)[];
  isMyTurn: boolean;
}

const GameBoard = ({ gameId, playerId, board, isMyTurn }: GameBoardProps) => {
  const { toast } = useToast();

  const handleMove = async (position: number) => {
    try {
      await tournamentService.makeMove(gameId, playerId, position);
      toast({
        title: "Move made!",
        description: "Waiting for opponent's move...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make move",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF0F7B]/20 to-[#F89B29]/20 rounded-lg blur-xl" />
      <div className="relative grid grid-cols-3 gap-2 max-w-[400px] mx-auto p-6 rounded-lg bg-black/40 backdrop-blur-sm border border-primary/50">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`game-cell ${!isMyTurn || cell !== null ? 'opacity-80' : 'hover:neon-border'}`}
            onClick={() => isMyTurn && cell === null && handleMove(index)}
          >
            {cell && (
              <span className={`text-5xl font-bold ${cell === 'X' ? 'text-[#FF0F7B]' : 'text-[#F89B29]'}`}>
                {cell}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;