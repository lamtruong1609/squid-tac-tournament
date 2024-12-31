import { useState } from "react";
import { PlayerRegistrationForm } from "@/components/tournament/PlayerRegistrationForm";
import { ActiveTournaments } from "@/components/tournament/ActiveTournaments";
import { LoginForm } from "@/components/auth/LoginForm";
import { PlayerTournaments } from "@/components/tournament/PlayerTournaments";
import { authService } from "@/services/authService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());

  if (isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Player Info and Games Section */}
          <div className="space-y-6">
            <PlayerTournaments />
          </div>
          
          {/* Active Tournaments Section */}
          <div className="space-y-6">
            <ActiveTournaments />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background z-0" />
      
      <div className="z-10 text-center max-w-2xl mx-auto px-4">
        <h1 className="text-6xl font-bold mb-6">
          Tic-Tac-Toe
          <span className="block text-primary mt-2">Tournament</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Enter the arena and prove your worth in this high-stakes tournament of skill and strategy.
        </p>

        <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onSuccess={() => setIsLoggedIn(true)} />
          </TabsContent>
          <TabsContent value="register">
            <PlayerRegistrationForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;