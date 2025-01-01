import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const loginSchema = z.object({
  playerName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      playerName: "",
      password: "",
    },
  });

  const checkLastGameResult = async (playerId: string) => {
    const { data: lastGame } = await supabase
      .from('games')
      .select('*')
      .or(`player_x.eq.${playerId},player_o.eq.${playerId}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastGame && lastGame.winner && lastGame.winner !== playerId && lastGame.winner !== 'draw') {
      navigate('/loser');
      return true;
    }
    return false;
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const { data: players, error } = await supabase
        .from('players')
        .select('id, name, password')
        .eq('name', values.playerName);

      if (error) throw error;
      
      const player = players?.[0];
      if (!player) {
        toast.error("Player not found");
        return;
      }

      if (player.password !== values.password) {
        toast.error("Invalid password");
        return;
      }

      // Store player info in localStorage
      localStorage.setItem('playerId', player.id);
      localStorage.setItem('playerName', player.name);
      
      toast.success("Login successful!");
      
      const isLoser = await checkLastGameResult(player.id);
      if (!isLoser) {
        onSuccess();
        navigate('/'); // Redirect to home page after successful login
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Invalid credentials",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="playerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Player Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </Form>
  );
};