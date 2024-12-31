import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface TournamentActionsProps {
  tournament: any;
  onAction: () => void;
}

export const TournamentActions = ({ tournament, onAction }: TournamentActionsProps) => {
  const handleStartTournament = async () => {
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({ status: "in_progress" })
        .eq("id", tournament.id);

      if (error) throw error;
      toast.success("Tournament started successfully");
      onAction();
    } catch (error) {
      toast.error("Failed to start tournament");
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