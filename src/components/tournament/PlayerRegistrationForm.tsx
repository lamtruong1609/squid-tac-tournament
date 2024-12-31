import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";
import { tournamentService } from "@/services/tournamentService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  playerName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  tournamentId: z.string({
    required_error: "Please select a tournament.",
  }),
  telegramUrl: z.string().url().optional().or(z.literal("")),
  xUrl: z.string().url().optional().or(z.literal("")),
});

export const PlayerRegistrationForm = () => {
  const navigate = useNavigate();
  
  const { data: tournaments } = useQuery({
    queryKey: ["available-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      password: "",
      tournamentId: "",
      telegramUrl: "",
      xUrl: "",
    },
  });

  const startGame = async (values: z.infer<typeof formSchema>) => {
    try {
      // Check if player exists
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id, name, password')
        .eq('name', values.playerName)
        .single();

      if (existingPlayer) {
        // Verify password for existing player
        if (existingPlayer.password !== values.password) {
          toast.error("Incorrect password for existing player");
          return;
        }

        // Check for active game
        const { data: activeGame } = await supabase
          .from('games')
          .select('*')
          .or(`player_x.eq.${existingPlayer.id},player_o.eq.${existingPlayer.id}`)
          .eq('status', 'waiting')
          .single();

        if (activeGame) {
          toast("Welcome Back!", {
            description: `You're already in a game. Waiting for opponent...`,
          });
          navigate(`/game/${activeGame.id}`);
          return;
        }
      }

      // Join tournament with selected ID
      const { gameId, playerId } = await tournamentService.joinTournament({
        playerName: values.playerName,
        password: values.password,
        tournamentId: values.tournamentId,
        telegramUrl: values.telegramUrl || null,
        xUrl: values.xUrl || null,
      });
      
      toast.success("Tournament Joined", {
        description: `Welcome ${values.playerName}! You've successfully joined the tournament.`,
      });
      
      form.reset();
      navigate(`/game/${gameId}`);
    } catch (error) {
      toast.error("Error Joining Tournament", {
        description: error instanceof Error ? error.message : "Failed to join tournament",
      });
    }
  };

  return (
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Enter password" 
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
          name="tournamentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Select Tournament</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background/50 backdrop-blur-sm border-primary/50">
                    <SelectValue placeholder="Select a tournament" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tournaments?.map((tournament) => (
                    <SelectItem key={tournament.id} value={tournament.id}>
                      {tournament.name} ({tournament.current_players}/{tournament.max_players} players)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
  );
};