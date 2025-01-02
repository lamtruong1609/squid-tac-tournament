import React from 'react';
import { Button } from './ui/button';
import { gameService } from '@/services/game/gameService';
import { toast } from 'sonner';
import RPSGame from './RPSGame';
import { RPSChoice } from '@/services/game/types';
import { GameStats } from './game/GameStats';
import { showGameResult } from './game/GameResult';

interface GameBoardProps {
  gameId: string;
  playerId: string;
  board: (string | null)[];
  isMyTurn: boolean;
  currentTurn: number;
  gameStatus: string;
  turnsHistory: any[];
  players: any[];
  currentPlayerSymbol: 'X' | 'O';
}

const GameBoard = ({ 
  gameId, 
  playerId, 
  board, 
  isMyTurn, 
  currentTurn,
  gameStatus,
  turnsHistory,
  players,
  currentPlayerSymbol
}: GameBoardProps) => {
  const currentPlayer = players?.find(p => p.id === playerId);
  const opponent = players?.find(p => p.id !== playerId);

  const handleMove = async (position: number) => {
    try {
      const result = await gameService.makeMove(gameId, playerId, position, currentTurn);
      
      if (result.status === 'completed') {
        showGameResult({ winner: result.winner, playerId, currentPlayer });
      } else if (result.status === 'rps_tiebreaker') {
        toast("It's a tie!", {
          description: "Time for Rock, Paper, Scissors! Squid Game style...",
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to make move");
    }
  };

  const handleRPSChoice = async (choice: RPSChoice) => {
    try {
      const result = await gameService.playRPS(gameId, playerId, choice);
      
      if (result.status === 'completed') {
        showGameResult({ winner: result.winner, playerId, currentPlayer });
      }
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to make choice");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <GameStats
        currentTurn={currentTurn}
        turnsHistory={turnsHistory}
        currentPlayer={currentPlayer}
        opponent={opponent}
        playerId={playerId}
      />

      {gameStatus === 'rps_tiebreaker' ? (
        <RPSGame
          gameId={gameId}
          playerId={playerId}
          isMyTurn={isMyTurn}
          opponent={opponent}
          onRPSChoice={handleRPSChoice}
        />
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