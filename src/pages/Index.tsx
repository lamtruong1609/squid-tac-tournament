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

const formSchema = z.object({
  playerName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50),
});

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
    },
  });

  const startGame = (values: z.infer<typeof formSchema>) => {
    setGameStarted(true);
    toast({
      title: `Welcome ${values.playerName}!`,
      description: "May the best player win!",
      className: "bg-primary text-white",
    });
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
            
            <Button
              type="submit"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 neon-border w-full"
            >
              Join Tournament
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Index;