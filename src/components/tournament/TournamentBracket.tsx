import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { User, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

interface Match {
  id: string;
  player_x: string;
  player_o: string | null;
  winner: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
}

interface MatchProps {
  match: Match;
  players: any[];
}

const MatchCard = ({ match, players }: MatchProps) => {
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'TBD';
  };

  return (
    <Link to={`/game/${match.id}`} className="block">
      <div className="border rounded-lg p-4 bg-background shadow-sm hover:border-primary/50 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-2 ${match.winner === match.player_x ? 'text-green-500 font-bold' : ''}`}>
              <User className="h-4 w-4" />
              {getPlayerName(match.player_x)}
            </span>
            {match.winner === match.player_x && <Trophy className="h-4 w-4 text-green-500" />}
          </div>
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-2 ${match.winner === match.player_o ? 'text-green-500 font-bold' : ''}`}>
              <User className="h-4 w-4" />
              {match.player_o ? getPlayerName(match.player_o) : 'Waiting...'}
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
  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ["tournament-matches", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select(`
          *,
          player_x_details:players!player_x(name),
          player_o_details:players!player_o(name)
        `)
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: players, isLoading: loadingPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  if (loadingMatches || loadingPlayers) {
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
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} players={players || []} />
        ))}
      </div>
    </div>
  );
};