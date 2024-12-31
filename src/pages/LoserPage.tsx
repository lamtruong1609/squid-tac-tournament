import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LoserPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      const playerId = localStorage.getItem('playerId');
      if (!playerId) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) {
        console.error('Error fetching player:', error);
        navigate('/');
        return;
      }

      setPlayer(data);
    };

    fetchPlayerData();

    toast({
      title: "Don't give up! 🎮",
      description: "Better luck next time!",
    });

    const timeout = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timeout);
  }, [navigate, toast]);

  const playerImage = "/lovable-uploads/302a852d-9e1b-444e-817f-c4395f8e9379.png";

  if (!player) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative text-center space-y-8 w-full max-w-md"
      >
        <h1 className="text-6xl font-bold text-white/80">
          Better Luck Next Time
        </h1>

        <Card className="bg-black/50 border-primary/50">
          <CardHeader>
            <CardTitle className="text-center">Player Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={playerImage} alt={player.name} />
                <AvatarFallback>{player.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-xl font-bold text-primary">{player.name}</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-black/30 p-2 rounded-lg">
                <div className="text-sm text-white/60">Wins</div>
                <div className="text-xl text-primary">{player.wins}</div>
              </div>
              <div className="bg-black/30 p-2 rounded-lg">
                <div className="text-sm text-white/60">Losses</div>
                <div className="text-xl text-accent">{player.losses}</div>
              </div>
              <div className="bg-black/30 p-2 rounded-lg">
                <div className="text-sm text-white/60">Draws</div>
                <div className="text-xl text-white/80">{player.draws}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-2xl text-white/60">
          Don't worry, you'll get them next time! 💪
        </p>
      </motion.div>
    </div>
  );
};

export default LoserPage;