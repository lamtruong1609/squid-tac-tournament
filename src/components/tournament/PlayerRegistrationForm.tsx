import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { tournamentService } from "@/services/tournamentService";
import { useNavigate } from "react-router-dom";
import { generateSquidAvatar } from "@/utils/avatarUtils";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  playerName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  telegramUrl: z.string().optional(),
  xUrl: z.string().optional(),
});

export const PlayerRegistrationForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      password: "",
      telegramUrl: "",
      xUrl: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Check if player exists
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('name', values.playerName)
        .single();

      if (existingPlayer) {
        toast.error("Player already exists. Please log in.");
        return;
      }

      // Generate Squid Game avatar for new players
      const avatarUrl = generateSquidAvatar();

      // Get latest active tournament or create one
      const { data: activeTournament } = await supabase
        .from('tournaments')
        .select('id')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const tournamentId = activeTournament?.id;

      // Join tournament
      await tournamentService.joinTournament({
        playerName: values.playerName,
        password: values.password,
        tournamentId: tournamentId,
        telegramUrl: values.telegramUrl || null,
        xUrl: values.xUrl || null,
        avatarUrl,
      });
      
      toast.success("Registration Successful", {
        description: `Welcome ${values.playerName}! You've been registered and will be paired with other players.`,
      });
      
      form.reset();
      navigate('/');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration Error", {
        description: error instanceof Error ? error.message : "Please try again later",
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

        <FormField
          control={form.control}
          name="telegramUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telegram URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://t.me/yourusername" />
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
              <FormLabel>X/Twitter URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://x.com/yourusername" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
    </Form>
  );
};