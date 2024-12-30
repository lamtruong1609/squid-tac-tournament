import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import GameBoard from "@/components/GameBoard";
import GeometricShapes from "@/components/GeometricShapes";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import WaitingPlayers from "@/components/WaitingPlayers";
import { Telegram, Twitter } from "lucide-react";

const formSchema = z.object({
  playerName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50),
  telegramUrl: z.string().url().optional().or(z.literal("")),
  xUrl: z.string().url().optional().or(z.literal("")),
});

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingPlayers, setWaitingPlayers] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      telegramUrl: "",
      xUrl: "",
    },
  });

  const startGame = (values: z.infer<typeof formSchema>) => {
    setWaitingPlayers([...waitingPlayers, values.playerName]);
    toast({
      title: `Welcome ${values.playerName}!`,
      description: "Waiting for more players to join...",
      className: "bg-primary text-white",
    });
    form.reset();
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(startGame)} className="space-y-6 max-w-sm mx-auto">
            <FormField
              control={form.control}
              name="playerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Enter Your Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Player Name" 
                      className="bg-background/50 backdrop-blur-sm border-primary/50 focus:border-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="telegramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center gap-2">
                      <Telegram className="w-5 h-5" />
                      Telegram URL (optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://t.me/yourusername" 
                        className="bg-background/50 backdrop-blur-sm border-primary/50 focus:border-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="xUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg flex items-center gap-2">
                      <Twitter className="w-5 h-5" />
                      X (Twitter) URL (optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://x.com/yourusername" 
                        className="bg-background/50 backdrop-blur-sm border-primary/50 focus:border-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button
              type="submit"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 neon-border w-full"
            >
              Join Tournament
            </Button>
          </form>
        </Form>

        {waitingPlayers.length > 0 && (
          <WaitingPlayers players={waitingPlayers} />
        )}
      </div>
    </div>
  );
};

export default Index;