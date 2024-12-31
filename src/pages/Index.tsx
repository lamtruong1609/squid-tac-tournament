import { useState } from "react";
import { PlayerRegistrationForm } from "@/components/tournament/PlayerRegistrationForm";
import { ActiveTournaments } from "@/components/tournament/ActiveTournaments";
import GameBoard from "@/components/GameBoard";

const Index = () => {
  const [currentGame, setCurrentGame] = useState<{
    gameId: string;
    playerId: string;
    board: (string | null)[];
    isMyTurn: boolean;
  } | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background z-0" />
      
      <div className="z-10 text-center max-w-2xl mx-auto px-4">
        <h1 className="text-6xl font-bold mb-6">
          Tic-Tac-Toe
          <span className="block text-primary mt-2">Tournament</span>
        </h1>
        
        {currentGame ? (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Game</h2>
            <GameBoard {...currentGame} />
          </div>
        ) : (
          <>
            <p className="text-xl text-muted-foreground mb-8">
              Enter the arena and prove your worth in this high-stakes tournament of skill and strategy.
            </p>

            <ActiveTournaments />
            <PlayerRegistrationForm />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;