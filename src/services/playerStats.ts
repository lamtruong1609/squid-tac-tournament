import { supabase } from '@/lib/supabase'
import { toast } from "sonner"

export const updatePlayerStats = async (
  playerXId: string, 
  playerOId: string | null, 
  result: 'win' | 'loss' | 'draw'
) => {
  if (!playerOId) return; // Can't update stats if there's no opponent

  // Update player X stats
  const { error: errorX } = await supabase
    .from('players')
    .update({
      wins: result === 'win' ? `wins + 1` : 'wins',
      losses: result === 'loss' ? `losses + 1` : 'losses',
      draws: result === 'draw' ? `draws + 1` : 'draws'
    })
    .eq('id', playerXId);

  if (errorX) {
    console.error('Error updating player X stats:', errorX);
    toast.error('Failed to update player X statistics');
    return;
  }

  // Update player O stats
  const { error: errorO } = await supabase
    .from('players')
    .update({
      wins: result === 'loss' ? `wins + 1` : 'wins',
      losses: result === 'win' ? `losses + 1` : 'losses',
      draws: result === 'draw' ? `draws + 1` : 'draws'
    })
    .eq('id', playerOId);

  if (errorO) {
    console.error('Error updating player O stats:', errorO);
    toast.error('Failed to update player O statistics');
    return;
  }

  toast.success('Player statistics updated successfully');
};