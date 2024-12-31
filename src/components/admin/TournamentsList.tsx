import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { TournamentBracket } from "../tournament/TournamentBracket";
import { MatchPairing } from "../tournament/MatchPairing";

export const TournamentsList = () => {
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCreateTournament = async () => {
    try {
      // First create the tournament
      const { data: tournament, error: tournamentError } = await supabase
        .from("tournaments")
        .insert({
          name: `Tournament ${new Date().toLocaleDateString()}`,
          status: "waiting",
          max_players: 100,
          current_players: 0,
        })
        .select()
        .single();

      if (tournamentError) throw tournamentError;

      // Get available players
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("*")
        .limit(8); // Limit to 8 players for initial matches

      if (playersError) throw playersError;

      // Create initial matches if we have players
      if (players && players.length >= 2) {
        for (let i = 0; i < players.length - 1; i += 2) {
          await supabase
            .from("games")
            .insert({
              tournament_id: tournament.id,
              player_x: players[i].id,
              player_o: players[i + 1].id,
              board: JSON.stringify(Array(9).fill(null)),
              next_player: 'X',
              status: 'waiting'
            });
        }
      }

      toast.success("Tournament created successfully");
    } catch (error) {
      console.error('Tournament creation error:', error);
      toast.error("Failed to create tournament");
    }
  };

  const handleStartTournament = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ status: "in_progress" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Tournament started successfully");
    } catch (error) {
      toast.error("Failed to start tournament");
    }
  };

  const handleStopTournament = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ status: "completed" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Tournament completed successfully");
    } catch (error) {
      toast.error("Failed to complete tournament");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary">Waiting</Badge>;
      case "in_progress":
        return <Badge className="bg-green-500">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) return <div>Loading tournaments...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Tournaments</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your tournaments
          </p>
        </div>
        <Button onClick={handleCreateTournament}>
          <Plus className="mr-2 h-4 w-4" />
          New Tournament
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments?.map((tournament) => (
              <TableRow 
                key={tournament.id}
                className="cursor-pointer"
                onClick={() => setSelectedTournament(tournament.id)}
              >
                <TableCell className="font-medium">
                  {tournament.name}
                </TableCell>
                <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {tournament.current_players}/{tournament.max_players}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="space-x-2">
                  {tournament.status === "waiting" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTournament(tournament.id);
                      }}
                    >
                      Start
                    </Button>
                  )}
                  {tournament.status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStopTournament(tournament.id);
                      }}
                    >
                      End
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedTournament && (
        <div className="space-y-8 mt-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Tournament Bracket</h3>
            <TournamentBracket tournamentId={selectedTournament} />
          </div>
          
          <div>
            <MatchPairing tournamentId={selectedTournament} />
          </div>
        </div>
      )}
    </div>
  );
};