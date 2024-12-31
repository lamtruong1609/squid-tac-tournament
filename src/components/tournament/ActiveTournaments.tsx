import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

export const ActiveTournaments = () => {
  const { data: activeTournaments, isLoading } = useQuery({
    queryKey: ["active-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading tournaments...</div>;

  if (!activeTournaments?.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Active Tournaments</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {activeTournaments.map((tournament) => (
          <div 
            key={tournament.id}
            className="p-4 border rounded-lg bg-card hover:bg-card/80 transition-colors"
          >
            <h3 className="font-semibold">{tournament.name}</h3>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="secondary">
                {tournament.current_players}/{tournament.max_players} Players
              </Badge>
              <Badge variant="outline">Waiting</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};