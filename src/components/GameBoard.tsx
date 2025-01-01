import React from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { gameService } from '@/services/game/gameService';
import { Badge } from './ui/badge';
import { Hand, Scroll, Scissors, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentPlayer = players?.find(p => p.id === playerId);
  const opponent = players?.find(p => p.id !== playerId);

  const getPlayerStats = (player: any) => {
    if (!player) return { wins: 0, losses: 0, draws: 0, ratio: '0%' };
    const total = player.wins + player.losses;
    const ratio = total > 0 ? Math.round((player.wins / total) * 100) : 0;
    return {
      wins: player.wins,
      losses: player.losses,
      draws: player.draws,
      ratio: `${ratio}%`
    };
  };

  const handleMove = async (position: number) => {
    try {
      const result = await gameService.makeMove(gameId, playerId, position, currentTurn);
      
      if (result.status === 'completed') {
        toast({
          title: result.winner === playerId ? `You won!` : `${opponent?.name || 'Opponent'} won!`,
          description: "Game Over",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          if (result.winner === playerId) {
            navigate('/winner');
          } else {
            navigate('/loser');
          }
        }, 1500);
      } else if (result.status === 'rps_tiebreaker') {
        toast({
          title: "It's a tie!",
          description: "Time for Rock, Paper, Scissors! Squid Game style...",
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
          title: result.winner === playerId ? `You won!` : `${opponent?.name || 'Opponent'} won!`,
          description: "Game Over",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          if (result.winner === playerId) {
            navigate('/winner');
          } else {
            navigate('/loser');
          }
        }, 1500);
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

  const playerImage = currentPlayerSymbol === 'X' 
    ? "/lovable-uploads/d1b808b8-eee4-46ca-9eed-2716706fb7a0.png"
    : "/lovable-uploads/302a852d-9e1b-444e-817f-c4395f8e9379.png";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-lg">
          Match {currentTurn}/3
        </Badge>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {turnsHistory.map((turn, index) => (
              <Badge 
                key={index} 
                variant={turn.winner === playerId ? "default" : turn.winner === 'draw' ? "secondary" : "destructive"}
              >
                {turn.winner === playerId 
                  ? `Won (${currentPlayer?.name})` 
                  : turn.winner === 'draw' 
                    ? 'Draw' 
                    : `Lost (${opponent?.name})`}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage src={playerImage} alt={currentPlayer?.name} />
              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{currentPlayer?.name}</div>
              <div className="text-xs text-muted-foreground">
                {getPlayerStats(currentPlayer).wins}W {getPlayerStats(currentPlayer).losses}L ({getPlayerStats(currentPlayer).ratio})
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameStatus === 'rps_tiebreaker' ? (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center gap-8 p-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl backdrop-blur-lg border border-pink-500/30"
        >
          <motion.h3 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-pink-500 text-center"
          >
            🦑 Squid Game: Final Round 🦑
          </motion.h3>
          
          <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => handleRPSChoice('rock')}
                disabled={!isMyTurn}
                className="w-full h-32 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-2 border-pink-400/50 shadow-lg shadow-pink-500/20"
              >
                <div className="flex flex-col items-center gap-2">
                  <Hand className="h-12 w-12" />
                  <span className="text-lg font-bold">Rock</span>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => handleRPSChoice('paper')}
                disabled={!isMyTurn}
                className="w-full h-32 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-2 border-pink-400/50 shadow-lg shadow-pink-500/20"
              >
                <div className="flex flex-col items-center gap-2">
                  <Scroll className="h-12 w-12" />
                  <span className="text-lg font-bold">Paper</span>
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => handleRPSChoice('scissors')}
                disabled={!isMyTurn}
                className="w-full h-32 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-2 border-pink-400/50 shadow-lg shadow-pink-500/20"
              >
                <div className="flex flex-col items-center gap-2">
                  <Scissors className="h-12 w-12" />
                  <span className="text-lg font-bold">Scissors</span>
                </div>
              </Button>
            </motion.div>
          </div>

          {!isMyTurn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl text-pink-400 mt-4"
            >
              Waiting for opponent's choice...
            </motion.div>
          )}
        </motion.div>
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