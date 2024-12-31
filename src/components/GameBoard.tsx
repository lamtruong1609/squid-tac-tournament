import React from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { gameService } from '@/services/gameService';
import { Badge } from './ui/badge';
import { Sword, HandRock, Scroll, Scissors } from 'lucide-react';

interface GameBoardProps {
  gameId: string;
  playerId: string;
  board: (string | null)[];
  isMyTurn: boolean;
  currentTurn: number;
  gameStatus: string;
  turnsHistory: any[];
}

const GameBoard = ({ 
  gameId, 
  playerId, 
  board, 
  isMyTurn, 
  currentTurn,
  gameStatus,
  turnsHistory 
}: GameBoardProps) => {
  const { toast } = useToast();

  const handleMove = async (position: number) => {
    try {
      const result = await gameService.makeMove(gameId, playerId, position, currentTurn);
      
      if (result.status === 'completed') {
        toast({
          title: result.winner === playerId ? "You won!" : "You lost!",
          description: "Game Over",
        });
      } else if (result.status === 'rps_tiebreaker') {
        toast({
          title: "It's a tie!",
          description: "Time for Rock, Paper, Scissors!",
        });
      } else {
        toast({
          title: "Move made!",
          description: "Waiting for opponent's move...",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make move",
        variant: "destructive",
      });
    }
  };

  const handleRPSChoice = async (choice: 'rock' | 'paper' | 'scissors') => {
    try {
      const result = await gameService.playRPS(gameId, playerId, choice);
      
      if (result.status === 'completed') {
        toast({
          title: result.winner === playerId ? "You won!" : "You lost!",
          description: "Game Over",
        });
      } else {
        toast({
          title: "Choice made!",
          description: "Waiting for opponent's choice...",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make choice",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-lg">
          Turn {currentTurn}/3
        </Badge>
        <div className="flex gap-2">
          {turnsHistory.map((turn, index) => (
            <Badge key={index} variant={turn.winner === playerId ? "success" : turn.winner === 'draw' ? "secondary" : "destructive"}>
              {turn.winner === playerId ? 'Won' : turn.winner === 'draw' ? 'Draw' : 'Lost'}
            </Badge>
          ))}
        </div>
      </div>

      {gameStatus === 'rps_tiebreaker' ? (
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-xl font-bold">Rock, Paper, Scissors!</h3>
          <div className="flex gap-4">
            <Button
              onClick={() => handleRPSChoice('rock')}
              disabled={!isMyTurn}
              className="p-6"
            >
              <HandRock className="h-8 w-8" />
            </Button>
            <Button
              onClick={() => handleRPSChoice('paper')}
              disabled={!isMyTurn}
              className="p-6"
            >
              <Scroll className="h-8 w-8" />
            </Button>
            <Button
              onClick={() => handleRPSChoice('scissors')}
              disabled={!isMyTurn}
              className="p-6"
            >
              <Scissors className="h-8 w-8" />
            </Button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default GameBoard;