import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export const PlayerTournaments = () => {
  const navigate = useNavigate();
  const playerId = localStorage.getItem('playerId');
  const playerName = localStorage.getItem('playerName');

  const { data: playerInfo, isLoading: isLoadingPlayer } = useQuery({
    queryKey: ['player-info', playerId],
    queryFn: () => playerId ? authService.getPlayerInfo(playerId) : Promise.resolve(null),
    enabled: !!playerId,
  });

  const { data: tournaments, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ['player-tournaments', playerId],
    queryFn: () => playerId ? authService.getPlayerTournaments(playerId) : Promise.resolve([]),
    enabled: !!playerId,
  });

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    window.location.reload();
  };

  if (isLoadingPlayer || isLoadingTournaments) {
    return <div>Loading...</div>;
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Player Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-accent rounded-lg">
            <div className="text-2xl font-bold">{playerInfo?.wins || 0}</div>
            <div className="text-sm text-muted-foreground">Wins</div>
          </div>
          <div className="text-center p-4 bg-accent rounded-lg">
            <div className="text-2xl font-bold">{playerInfo?.losses || 0}</div>
            <div className="text-sm text-muted-foreground">Losses</div>
          </div>
          <div className="text-center p-4 bg-accent rounded-lg">
            <div className="text-2xl font-bold">{playerInfo?.draws || 0}</div>
            <div className="text-sm text-muted-foreground">Draws</div>
          </div>
          <div className="text-center p-4 bg-accent rounded-lg">
            <div className="text-2xl font-bold">
              {((playerInfo?.wins || 0) / Math.max((playerInfo?.wins || 0) + (playerInfo?.losses || 0), 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {playerInfo?.telegram_url && (
          <div className="mt-4 text-sm text-muted-foreground">
            Telegram: <a href={playerInfo.telegram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{playerInfo.telegram_url}</a>
          </div>
        )}
        {playerInfo?.x_url && (
          <div className="mt-2 text-sm text-muted-foreground">
            X: <a href={playerInfo.x_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{playerInfo.x_url}</a>
          </div>
        )}
      </Card>

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