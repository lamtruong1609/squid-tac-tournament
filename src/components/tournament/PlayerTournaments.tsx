import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TournamentBracket } from "./TournamentBracket";

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

  const playerImage = "/lovable-uploads/d1b808b8-eee4-46ca-9eed-2716706fb7a0.png";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Welcome, {playerName}!</h2>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-6"
      >
        <Card className="bg-black/50 border-accent/50 p-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24 border-2 border-accent">
                <AvatarImage src={playerImage} alt={playerName || ''} />
                <AvatarFallback>{playerName?.[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-xl font-bold text-center text-accent">{playerName}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-sm text-white/60">Wins</div>
                <div className="text-2xl text-accent">{playerInfo?.wins || 0}</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-sm text-white/60">Losses</div>
                <div className="text-2xl text-primary">{playerInfo?.losses || 0}</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-sm text-white/60">Draws</div>
                <div className="text-2xl text-white/80">{playerInfo?.draws || 0}</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-sm text-white/60">Win Rate</div>
                <div className="text-2xl text-accent">
                  {((playerInfo?.wins || 0) / Math.max((playerInfo?.wins || 0) + (playerInfo?.losses || 0), 1) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {playerInfo?.telegram_url && (
              <div className="text-sm text-white/60">
                Telegram: <a href={playerInfo.telegram_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{playerInfo.telegram_url}</a>
              </div>
            )}
            {playerInfo?.x_url && (
              <div className="text-sm text-white/60">
                X: <a href={playerInfo.x_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{playerInfo.x_url}</a>
              </div>
            )}
          </div>
        </Card>

        {tournaments?.[0]?.tournament_id && (
          <Card className="bg-black/50 border-accent/50 p-6">
            <h3 className="text-xl font-bold mb-4">Tournament Bracket</h3>
            <TournamentBracket tournamentId={tournaments[0].tournament_id} />
          </Card>
        )}

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
      </motion.div>
    </div>
  );
};