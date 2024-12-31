import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { tournamentService } from "@/services/tournamentService";

interface GameBoardProps {
  gameId: string;
  playerId: string;
  onGameEnd: () => void;
}

const GameBoard = ({ gameId, playerId, onGameEnd }: GameBoardProps) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const subscription = tournamentService.subscribeToGame(gameId, (payload) => {
      const game = payload.new;
      setBoard(JSON.parse(game.board));
      setIsMyTurn(
        (game.next_player === 'X' && game.player_x === playerId) ||
        (game.next_player === 'O' && game.player_o === playerId)
      );
      if (game.winner) {
        setWinner(game.winner);
        if (game.winner === 'draw') {
          toast({
            title: "Game Over",
            description: "It's a draw!",
            className: "bg-muted text-white",
          });
        } else {
          const isWinner = 
            (game.winner === 'X' && game.player_x === playerId) ||
            (game.winner === 'O' && game.player_o === playerId);
          toast({
            title: isWinner ? "Victory!" : "Defeat!",
            description: isWinner ? "Congratulations on your win!" : "Better luck next time!",
            className: isWinner ? "bg-green-600" : "bg-red-600",
          });
        }
      }
    });

    return () => {
      subscription.then(sub => sub.unsubscribe());
    };
  }, [gameId, playerId]);

  const handleClick = async (position: number) => {
    if (!isMyTurn || board[position] || winner) return;

    try {
      await tournamentService.makeMove(gameId, playerId, position);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make move",
        variant: "destructive",
      });
    }
  };

  const renderCell = (position: number) => {
    return (
      <div
        key={position}
        className={`game-cell ${isMyTurn && !board[position] ? 'cursor-pointer hover:bg-primary/10' : ''}`}
        onClick={() => handleClick(position)}
      >
        {board[position]}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          {winner 
            ? winner === "draw" 
              ? "Game Over - It's a Draw!" 
              : `Player ${winner} Wins!`
            : isMyTurn 
              ? "Your Turn" 
              : "Opponent's Turn"}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 p-4 bg-secondary/20 rounded-lg neon-border">
        {Array(9).fill(null).map((_, i) => renderCell(i))}
      </div>

      <Button
        onClick={onGameEnd}
        className="mt-8 bg-primary hover:bg-primary/90"
      >
        Return to Menu
      </Button>
    </div>
  );
};

export default GameBoard;