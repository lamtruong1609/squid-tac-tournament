import { Trophy, Skull } from 'lucide-react';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface GameResultProps {
  winner: string | null;
  playerId: string;
  currentPlayer: any;
}

export const showGameResult = ({ winner, playerId, currentPlayer }: GameResultProps) => {
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const isWinner = winner === playerId;
  
  // Show animated toast notification
  toast(
    isWinner ? "Victory! 🎮" : "Game Over! 💀",
    {
      description: isWinner 
        ? "Congratulations! You've won the game!" 
        : "Better luck next time!",
      icon: isWinner ? <Trophy className="h-5 w-5 text-yellow-500" /> : <Skull className="h-5 w-5 text-red-500" />,
      duration: 5000,
      className: isWinner 
        ? "bg-gradient-to-r from-yellow-500/20 to-pink-500/20 border-yellow-500/50" 
        : "bg-gradient-to-r from-red-500/20 to-purple-500/20 border-red-500/50"
    }
  );

  // Show modal toast with stats
  uiToast({
    title: isWinner ? "🎮 Victory!" : "💀 Defeat",
    description: (
      <div className="space-y-2">
        <p>{isWinner ? "You've proven your worth!" : "You've been eliminated..."}</p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center p-2 bg-black/20 rounded">
            <div className="text-sm text-muted-foreground">Wins</div>
            <div className="text-lg font-bold">{currentPlayer?.wins || 0}</div>
          </div>
          <div className="text-center p-2 bg-black/20 rounded">
            <div className="text-sm text-muted-foreground">Losses</div>
            <div className="text-lg font-bold">{currentPlayer?.losses || 0}</div>
          </div>
          <div className="text-center p-2 bg-black/20 rounded">
            <div className="text-sm text-muted-foreground">Draws</div>
            <div className="text-lg font-bold">{currentPlayer?.draws || 0}</div>
          </div>
        </div>
      </div>
    ),
    className: "squid-game-toast",
  });

  // Navigate back to home after a delay
  setTimeout(() => {
    navigate('/');
  }, 5000);
};