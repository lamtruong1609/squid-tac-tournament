import { useState } from "react";
import { PlayerRegistrationForm } from "@/components/tournament/PlayerRegistrationForm";
import { ActiveTournaments } from "@/components/tournament/ActiveTournaments";
import { LoginForm } from "@/components/auth/LoginForm";
import { Web3LoginButton } from "@/components/auth/Web3LoginButton";
import { PlayerTournaments } from "@/components/tournament/PlayerTournaments";
import { authService } from "@/services/authService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());

  if (isLoggedIn) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <PlayerTournaments />
          <ActiveTournaments />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background z-0" />
      
      <div className="z-10 w-full max-w-6xl mx-auto px-4 flex items-center justify-between gap-8">
        <div className="flex-1 max-w-md">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">
              Tic-Tac-Toe
              <span className="block text-primary mt-2">Tournament</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Enter the arena and prove your worth in this high-stakes tournament of skill and strategy.
            </p>

            <div className="space-y-4">
              <Web3LoginButton />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Tabs defaultValue="login" className="w-full">
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
        </div>

        <div className="hidden lg:block flex-1 max-w-md">
          <img 
            src="/lovable-uploads/1d13f0fa-1fa6-4661-bebc-fc484a493969.png" 
            alt="Squid Game Player"
            className="w-full h-auto rounded-lg shadow-2xl floating glowing"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;