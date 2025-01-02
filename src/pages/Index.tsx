import { useState, useEffect } from "react";
import { PlayerRegistrationForm } from "@/components/tournament/PlayerRegistrationForm";
import { ActiveTournaments } from "@/components/tournament/ActiveTournaments";
import { LoginForm } from "@/components/auth/LoginForm";
import { Web3LoginButton } from "@/components/auth/Web3LoginButton";
import { PlayerTournaments } from "@/components/tournament/PlayerTournaments";
import { authService } from "@/services/authService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Twitter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    };

    checkAuth();
    // Check auth status when the window regains focus
    window.addEventListener('focus', checkAuth);
    return () => window.removeEventListener('focus', checkAuth);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard!",
      duration: 2000,
    });
  };

  // ... keep existing code (render methods)

  return isLoggedIn ? (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <PlayerTournaments />
        <ActiveTournaments />
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden">
      <div className="w-full">
        <img 
          src="/lovable-uploads/9412e132-468a-4296-8e3a-327584e4ee1e.png" 
          alt="Squid Game 2 AI Banner"
          className="w-full h-48 object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background z-0" />
      
      <div className="z-10 w-full max-w-6xl mx-auto px-4 flex items-center justify-between gap-8 mt-16">
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

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-sm border-t border-primary/20 z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
          <div>
            CA: <button 
              onClick={() => copyToClipboard("Coming Soon")}
              className="hover:text-primary transition-colors"
            >
              Coming Soon
            </button>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          <a 
            href="https://x.com/SquidGame2AIBOT" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Twitter size={16} /> X: @SquidGame2AIBOT
          </a>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          <a 
            href="https://t.me/Squid_Game2AI" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            📱 Telegram: Squid_Game2AI
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
