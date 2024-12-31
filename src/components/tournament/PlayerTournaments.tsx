import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const PlayerTournaments = () => {
  const navigate = useNavigate();
  const playerId = localStorage.getItem('playerId');
  const playerName = localStorage.getItem('playerName');

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['player-tournaments', playerId],
    queryFn: () => playerId ? authService.getPlayerTournaments(playerId) : Promise.resolve([]),
    enabled: !!playerId,
  });

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    window.location.reload();
  };

  if (isLoading) {
    return <div>Loading your tournaments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Welcome, {playerName}!</h2>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Active Games</h3>
        {tournaments?.length === 0 ? (
          <p className="text-muted-foreground">You haven't joined any tournaments yet.</p>
        ) : (
          <div className="grid gap-4">
            {tournaments?.map((game) => (
              <div
                key={game.id}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => navigate(`/game/${game.id}`)}
              >
                <h4 className="font-medium">{game.tournament?.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Status: {game.tournament?.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};