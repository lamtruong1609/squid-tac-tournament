import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { tournamentManagementService } from "@/services/tournamentManagementService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface TournamentActionsProps {
  tournament: any;
  onAction: () => void;
}

export const TournamentActions = ({ tournament, onAction }: TournamentActionsProps) => {
  const handleStartTournament = async () => {
    try {
      // Get all available players
      const players = await tournamentManagementService.getAvailablePlayers();
      
      // Create initial matches
      await tournamentManagementService.createInitialMatches(tournament, players);

      // Update tournament status
      const { error } = await supabase
        .from("tournaments")
        .update({ 
          status: "in_progress",
          current_round: 1
        })
        .eq("id", tournament.id);

      if (error) throw error;
      toast.success("Tournament started successfully");
      onAction();
    } catch (error) {
      console.error('Error starting tournament:', error);
      toast.error("Failed to start tournament");
    }
  };

  const handleNextRound = async () => {
    try {
      await tournamentManagementService.createNextRoundMatches(
        tournament.id,
        tournament.current_round
      );
      toast.success("Next round started successfully");
      onAction();
    } catch (error) {
      console.error('Error starting next round:', error);
      toast.error("Failed to start next round");
    }
  };

  const handleStopTournament = async () => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ status: "completed" })
        .eq("id", tournament.id);

      if (error) throw error;
      toast.success("Tournament completed successfully");
      onAction();
    } catch (error) {
      toast.error("Failed to complete tournament");
    }
  };

  const handleDeleteTournament = async () => {
    try {
      // First delete all games associated with this tournament
      const { error: gamesError } = await supabase
        .from("games")
        .delete()
        .eq("tournament_id", tournament.id);

      if (gamesError) throw gamesError;

      // Then delete the tournament
      const { error: tournamentError } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", tournament.id);

      if (tournamentError) throw tournamentError;

      toast.success("Tournament deleted successfully");
      onAction();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast.error("Failed to delete tournament");
    }
  };

  return (
    <div className="space-x-2">
      {tournament.status === "waiting" && (
        <Button
          size="sm"
          onClick={handleStartTournament}
        >
          Start
        </Button>
      )}
      {tournament.status === "in_progress" && !tournament.is_final_round && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleNextRound}
        >
          Next Round
        </Button>
      )}
      {tournament.status === "in_progress" && (
        <Button
          size="sm"
          variant="destructive"
          onClick={handleStopTournament}
        >
          End
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tournament? This action cannot be undone.
              All associated games will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTournament}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};