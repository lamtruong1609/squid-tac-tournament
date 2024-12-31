import { supabase } from '@/lib/supabase'
import { toast } from "sonner"

export const updatePlayerStats = async (
  playerXId: string, 
  playerOId: string | null, 
  result: 'win' | 'loss' | 'draw'
) => {
  if (!playerOId) return; // Can't update stats if there's no opponent

  try {
    // First get current stats
    const { data: playerX } = await supabase
      .from('players')
      .select('wins, losses, draws')
      .eq('id', playerXId)
      .single();

    const { data: playerO } = await supabase
      .from('players')
      .select('wins, losses, draws')
      .eq('id', playerOId)
      .single();

    if (!playerX || !playerO) {
      throw new Error('Could not find player stats');
    }

    // Update player X stats
    const { error: errorX } = await supabase
      .from('players')
      .update({
        wins: result === 'win' ? playerX.wins + 1 : playerX.wins,
        losses: result === 'loss' ? playerX.losses + 1 : playerX.losses,
        draws: result === 'draw' ? playerX.draws + 1 : playerX.draws
      })
      .eq('id', playerXId);

    if (errorX) throw errorX;

    // Update player O stats
    const { error: errorO } = await supabase
      .from('players')
      .update({
        wins: result === 'loss' ? playerO.wins + 1 : playerO.wins,
        losses: result === 'win' ? playerO.losses + 1 : playerO.losses,
        draws: result === 'draw' ? playerO.draws + 1 : playerO.draws
      })
      .eq('id', playerOId);

    if (errorO) throw errorO;

    toast.success('Player statistics updated successfully');
  } catch (error) {
    console.error('Error updating player stats:', error);
    toast.error('Failed to update player statistics');
  }
};