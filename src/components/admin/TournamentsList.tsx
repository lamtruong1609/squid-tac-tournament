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
import { toast } from "sonner";

export const TournamentsList = () => {
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

  if (isLoading) return <div>Loading tournaments...</div>;

  return (
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
            <TableRow key={tournament.id}>
              <TableCell>{tournament.name}</TableCell>
              <TableCell>{tournament.status}</TableCell>
              <TableCell>
                {tournament.current_players}/{tournament.max_players}
              </TableCell>
              <TableCell className="space-x-2">
                {tournament.status === "waiting" && (
                  <Button
                    size="sm"
                    onClick={() => handleStartTournament(tournament.id)}
                  >
                    Start
                  </Button>
                )}
                {tournament.status === "in_progress" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStopTournament(tournament.id)}
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
  );
};