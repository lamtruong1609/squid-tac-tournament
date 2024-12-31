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
    <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
      {board.map((cell, index) => (
        <Button
          key={index}
          variant={cell ? "secondary" : "outline"}
          className="h-24 text-3xl font-bold"
          disabled={!isMyTurn || cell !== null}
          onClick={() => handleMove(index)}
        >
          {cell}
        </Button>
      ))}
    </div>
  );
};

export default GameBoard;