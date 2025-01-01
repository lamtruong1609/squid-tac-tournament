import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { tournamentManagementService } from "@/services/tournamentManagementService";
import { Button } from "@/components/ui/button";
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
import { useQueryClient } from "@tanstack/react-query";

interface TournamentActionsProps {
  tournament: any;
}

export const TournamentActions = ({ tournament }: TournamentActionsProps) => {
  const queryClient = useQueryClient();

  const handleStartTournament = async () => {
    try {
      const players = await tournamentManagementService.getAvailablePlayers();
      const playerCount = await tournamentManagementService.startTournament(tournament, players);

      toast.success("Tournament started successfully");
      await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      await queryClient.invalidateQueries({ queryKey: ["players"] });
    } catch (error) {
      console.error('Error starting tournament:', error);
      toast.error("Failed to start tournament");
    }
  };

  const handleDeleteTournament = async () => {
    try {
      // First delete all matches in the tournament
      const { error: matchesError } = await supabase
        .from("games")
        .delete()
        .eq("tournament_id", tournament.id);

      if (matchesError) {
        console.error('Error deleting matches:', matchesError);
        throw matchesError;
      }

      // Then delete the tournament itself
      const { error: tournamentError } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", tournament.id);

      if (tournamentError) {
        console.error('Error deleting tournament:', tournamentError);
        throw tournamentError;
      }

      toast.success("Tournament deleted successfully");
      
      // Invalidate both tournaments and games queries to refresh the UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
        queryClient.invalidateQueries({ queryKey: ["games"] })
      ]);
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast.error("Failed to delete tournament");
    }
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {tournament.status === "waiting" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartTournament}
        >
          Start
        </Button>
      )}
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tournament? This action cannot be undone.
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
