import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { generateSquidAvatar } from "@/utils/avatarUtils";
import { toast } from "sonner";

interface Match {
  id: string;
  player_x: string;
  player_o: string | null;
  winner: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
  tournament_id: string;
}

interface MatchProps {
  match: Match;
  players: any[];
}

const MatchCard = ({ match, players }: MatchProps) => {
  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return 'Waiting...';
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  const getPlayerAvatar = (playerId: string | null) => {
    if (!playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player?.avatar_url || generateSquidAvatar();
  };

  return (
    <Link to={`/game/${match.id}`} className="block">
      <div className="border rounded-lg p-4 bg-background shadow-sm hover:border-primary/50 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-2 ${match.winner === match.player_x ? 'text-green-500 font-bold' : ''}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={getPlayerAvatar(match.player_x)} alt={getPlayerName(match.player_x)} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              {getPlayerName(match.player_x)}
            </span>
            {match.winner === match.player_x && <Trophy className="h-4 w-4 text-green-500" />}
          </div>
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-2 ${match.winner === match.player_o ? 'text-green-500 font-bold' : ''}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={getPlayerAvatar(match.player_o)} alt={getPlayerName(match.player_o)} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              {getPlayerName(match.player_o)}
            </span>
            {match.winner === match.player_o && <Trophy className="h-4 w-4 text-green-500" />}
          </div>
          <Badge 
            variant={match.status === 'completed' ? 'default' : 
                    match.status === 'in_progress' ? 'secondary' : 'outline'}
            className="w-full justify-center"
          >
            {match.status === 'completed' ? 'Completed' : 
             match.status === 'in_progress' ? 'In Progress' : 'Waiting'}
          </Badge>
        </div>
      </div>
    </Link>
  );
};

export const TournamentBracket = ({ tournamentId }: { tournamentId: string }) => {
  const { data: tournament, isLoading: loadingTournament } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .maybeSingle(); // Use maybeSingle instead of single to handle missing data

      if (error) {
        console.error("Error fetching tournament:", error);
        toast.error("Failed to load tournament information");
        return null;
      }
      return data;
    },
  });

  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ["tournament-matches", tournamentId],
    queryFn: async () => {
      console.log("Fetching matches for tournament:", tournamentId);
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("tournament_id", tournamentId);

      if (error) {
        console.error("Error fetching matches:", error);
        toast.error("Failed to load matches");
        throw error;
      }
      console.log("Fetched matches:", data);
      return data;
    },
  });

  const { data: players, isLoading: loadingPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*");

      if (error) {
        console.error("Error fetching players:", error);
        toast.error("Failed to load player information");
        throw error;
      }
      return data;
    },
  });

  if (loadingMatches || loadingPlayers || loadingTournament) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-muted-foreground">Loading tournament bracket...</div>
      </div>
    );
  }

  if (!matches?.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-muted-foreground">No matches found in this tournament.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tournament && (
        <div className="bg-black/30 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-accent">{tournament.name}</h2>
            <Badge 
              variant={tournament.status === 'completed' ? 'default' : 
                      tournament.status === 'in_progress' ? 'secondary' : 'outline'}
            >
              {tournament.status === 'completed' ? 'Completed' : 
               tournament.status === 'in_progress' ? 'In Progress' : 'Waiting'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Players: {tournament.current_players}/{tournament.max_players}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created: {format(new Date(tournament.created_at), 'MMM d, yyyy')}</span>
            </div>
            {tournament.winner && (
              <div className="flex items-center gap-2 text-accent">
                <Trophy className="h-4 w-4" />
                <span>Winner: {players?.find(p => p.id === tournament.winner)?.name || 'Unknown'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} players={players || []} />
          ))}
        </div>
      </div>
    </div>
  );
};