import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MessageCircle, Twitter } from "lucide-react";
import { tournamentService } from "@/services/tournamentService";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import GameBoard from "@/components/GameBoard";

const formSchema = z.object({
  playerName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50),
  telegramUrl: z.string().url().optional().or(z.literal("")),
  xUrl: z.string().url().optional().or(z.literal("")),
});

const Index = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      telegramUrl: "",
      xUrl: "",
    },
  });

  const [currentGame, setCurrentGame] = useState<{
    gameId: string;
    playerId: string;
    board: (string | null)[];
    isMyTurn: boolean;
  } | null>(null);

  const { data: activeTournaments, isLoading } = useQuery({
    queryKey: ["active-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const startGame = async (values: z.infer<typeof formSchema>) => {
    try {
      const { gameId, playerId } = await tournamentService.joinTournament({
        playerName: values.playerName,
        telegramUrl: values.telegramUrl || null,
        xUrl: values.xUrl || null,
      });
      
      // Subscribe to game updates
      const subscription = tournamentService.subscribeToGame(gameId, (payload) => {
        const game = payload.new;
        setCurrentGame({
          gameId,
          playerId,
          board: JSON.parse(game.board),
          isMyTurn: 
            (game.next_player === 'X' && game.player_x === playerId) ||
            (game.next_player === 'O' && game.player_o === playerId),
        });
      });
      
      toast({
        title: `Welcome ${values.playerName}!`,
        description: "You've successfully joined the tournament.",
        className: "bg-primary text-white",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join tournament",
        variant: "destructive",
      });
    }
  };

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

            {activeTournaments && activeTournaments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Active Tournaments</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeTournaments.map((tournament) => (
                    <div 
                      key={tournament.id}
                      className="p-4 border rounded-lg bg-card hover:bg-card/80 transition-colors"
                    >
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary">
                          {tournament.current_players}/{tournament.max_players} Players
                        </Badge>
                        <Badge variant="outline">Waiting</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                          <MessageCircle className="w-5 h-5" />
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
                  className="w-full text-lg px-8 py-6 bg-primary hover:bg-primary/90"
                >
                  Join Tournament
                </Button>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
