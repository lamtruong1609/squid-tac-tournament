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
  tournamentId: z.string().nonempty("Tournament ID is required"),
});

export const PlayerRegistrationForm = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      password: "",
      tournamentId: "",
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

      // Join tournament with selected ID
      await tournamentService.joinTournament({
        playerName: values.playerName,
        password: values.password,
        tournamentId: values.tournamentId,
        avatarUrl,
      });
      
      toast.success("Tournament Joined", {
        description: `Welcome ${values.playerName}! You've successfully joined the tournament.`,
      });
      
      form.reset();
      navigate('/');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Error Joining Tournament", {
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
          name="tournamentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tournament ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Join Tournament
        </Button>
      </form>
    </Form>
  );
};