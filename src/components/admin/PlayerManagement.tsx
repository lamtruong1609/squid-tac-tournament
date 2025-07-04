import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trophy, User } from "lucide-react";
import { toast } from "sonner";

export const PlayerManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: players, isLoading, refetch } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, wins, losses, draws, telegram_url, x_url")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching players:", error);
        toast.error("Failed to load players");
        throw error;
      }
      return data;
    },
  });

  const filteredPlayers = players?.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (wins: number, losses: number) => {
    if (wins + losses === 0) return (
      <Badge variant="secondary">New Player</Badge>
    );
    if (wins > losses) return (
      <Badge className="bg-green-500">Active Winner</Badge>
    );
    return (
      <Badge variant="destructive">Eliminated</Badge>
    );
  };

  const handleDeletePlayer = async (id: string) => {
    try {
      // First delete all games associated with this player
      const { error: gamesError } = await supabase
        .from("games")
        .delete()
        .or(`player_x.eq.${id},player_o.eq.${id}`);

      if (gamesError) {
        console.error("Error deleting games:", gamesError);
        throw gamesError;
      }

      // Then delete the player
      const { error: playerError } = await supabase
        .from("players")
        .delete()
        .eq("id", id);

      if (playerError) {
        console.error("Error deleting player:", playerError);
        throw playerError;
      }

      toast.success("Player deleted successfully");
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error("Failed to delete player");
    }
  };

  if (isLoading) return <div>Loading players...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <User className="h-3 w-3" />
            {players?.length || 0} Players
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Trophy className="h-3 w-3" />
            {players?.filter(p => p.wins > p.losses).length || 0} Winners
          </Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Wins</TableHead>
              <TableHead>Losses</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers?.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>
                  {getStatusBadge(player.wins, player.losses)}
                </TableCell>
                <TableCell>{player.wins}</TableCell>
                <TableCell>{player.losses}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {player.telegram_url && (
                      <a
                        href={player.telegram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Telegram
                      </a>
                    )}
                    {player.x_url && (
                      <a
                        href={player.x_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        X (Twitter)
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePlayer(player.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};