import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { tournamentManagementService } from "@/services/tournamentManagementService";

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
    </div>
  );
};