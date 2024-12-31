import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";
import { toast } from "sonner";

export const MatchPairing = ({ tournamentId }: { tournamentId: string }) => {
  const [isPairing, setIsPairing] = useState(false);

  const { data: availablePlayers, isLoading } = useQuery({
    queryKey: ["available-players", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleAutoPair = async () => {
    if (!availablePlayers?.length) return;
    setIsPairing(true);

    try {
      // Create pairs of players
      for (let i = 0; i < availablePlayers.length - 1; i += 2) {
        const { error } = await supabase
          .from("games")
          .insert({
            tournament_id: tournamentId,
            player_x: availablePlayers[i].id,
            player_o: availablePlayers[i + 1].id,
            board: JSON.stringify(Array(9).fill(null)),
            next_player: 'X',
            status: 'waiting'
          });

        if (error) throw error;
      }

      toast.success("Players paired successfully");
    } catch (error) {
      toast.error("Failed to pair players");
    } finally {
      setIsPairing(false);
    }
  };

  if (isLoading) return <div>Loading players...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">Match Pairing</h3>
          <p className="text-sm text-muted-foreground">
            Pair players for the next round of matches
          </p>
        </div>
        <Button 
          onClick={handleAutoPair} 
          disabled={isPairing || !availablePlayers?.length}
        >
          <Users className="mr-2 h-4 w-4" />
          Auto-Pair Players
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Win/Loss Ratio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availablePlayers?.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {player.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    Available
                  </Badge>
                </TableCell>
                <TableCell>
                  {player.wins}/{player.losses}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};