import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { User, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Match {
  id: string;
  player_x: string;
  player_o: string | null;
  winner: string | null;
  status: 'waiting' | 'in_progress' | 'completed';
  tournament_id: string;
  round: number;
}

interface MatchNodeProps {
  match: Match;
  players: any[];
  level: number;
}

const MatchNode = ({ match, players, level }: MatchNodeProps) => {
  const getPlayerName = (playerId: string | null) => {
    if (!playerId) return 'Waiting...';
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: level * 0.2 }}
      className="relative"
    >
      <Link to={`/game/${match.id}`}>
        <div className="border rounded-lg p-4 bg-background/80 backdrop-blur-sm shadow-lg hover:border-primary/50 transition-colors w-64">
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
    </motion.div>
  );
};

export const TournamentBracketTree = ({ tournamentId }: { tournamentId: string }) => {
  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ["tournament-matches", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order('round', { ascending: true });

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

  // Group matches by round
  const matchesByRound = matches.reduce((acc: { [key: number]: Match[] }, match: Match) => {
    const round = match.round || 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {});

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-16 p-8 min-w-max">
        {Object.entries(matchesByRound).map(([round, roundMatches]) => (
          <div key={round} className="flex flex-col gap-8">
            <h3 className="text-lg font-semibold text-center text-white/80">
              Round {round}
            </h3>
            <div className="space-y-16">
              {roundMatches.map((match) => (
                <MatchNode 
                  key={match.id} 
                  match={match} 
                  players={players || []} 
                  level={parseInt(round)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};