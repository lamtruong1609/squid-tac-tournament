import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TournamentBracket } from "../tournament/TournamentBracket";
import { MatchPairing } from "../tournament/MatchPairing";
import { TournamentActions } from "./TournamentActions";
import { tournamentManagementService } from "@/services/tournamentManagementService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const TournamentsList = () => {
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState("8");
  const queryClient = useQueryClient();

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
    setIsCreating(true);
    try {
      const tournament = await tournamentManagementService.createTournament(parseInt(maxPlayers));
      toast.success("Tournament created successfully");
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    } catch (error) {
      console.error('Tournament creation error:', error);
      toast.error("Failed to create tournament");
    } finally {
      setIsCreating(false);
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
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Tournament
        </Button>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tournament</DialogTitle>
            <DialogDescription>
              Set up a new Squid Game tournament round
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="maxPlayers">Maximum Players</Label>
              <Input
                id="maxPlayers"
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                min="4"
                max="32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCreateDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTournament} 
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {isCreating ? "Creating..." : "Create Tournament"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <TableCell>
                  <TournamentActions tournament={tournament} />
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