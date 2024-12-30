import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import GameBoard from "@/components/GameBoard";
import GeometricShapes from "@/components/GeometricShapes";

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();

  const startGame = () => {
    setGameStarted(true);
    toast({
      title: "Game Started",
      description: "May the best player win!",
      className: "bg-primary text-white",
    });
  };

  if (gameStarted) {
    return <GameBoard onGameEnd={() => setGameStarted(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <GeometricShapes />
      
      <div className="z-10 text-center">
        <h1 className="text-6xl font-bold mb-6 glowing">
          Tic-Tac-Toe
          <span className="block text-primary mt-2">Tournament</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          Enter the arena and prove your worth in this high-stakes tournament of skill and strategy.
        </p>
        
        <Button
          onClick={startGame}
          className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 neon-border"
        >
          Join Tournament
        </Button>
      </div>
    </div>
  );
};

export default Index;