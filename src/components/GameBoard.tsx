import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface GameBoardProps {
  onGameEnd: () => void;
}

const GameBoard = ({ onGameEnd }: GameBoardProps) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;

    const newBoard = board.slice();
    newBoard[i] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      toast({
        title: `Winner: Player ${result.winner}`,
        description: "Congratulations on your victory!",
        className: "bg-accent text-white",
      });
    } else if (!newBoard.includes(null)) {
      setWinner("draw");
      toast({
        title: "Game Over",
        description: "It's a draw!",
        className: "bg-muted text-white",
      });
    }
  };

  const renderCell = (i: number) => {
    const winResult = calculateWinner(board);
    const isWinningCell = winResult?.line?.includes(i);

    return (
      <div
        className={`game-cell ${isWinningCell ? "winner" : ""}`}
        onClick={() => handleClick(i)}
      >
        {board[i]}
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
            : `Current Player: ${isXNext ? "X" : "O"}`}
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