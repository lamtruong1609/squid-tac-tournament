import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const LoserPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Don't give up! 🎮",
      description: "Waiting for lucky air drop...",
    });

    // Redirect to home after 10 seconds
    const timeout = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timeout);
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative text-center space-y-8"
      >
        <h1 className="text-6xl font-bold text-white/80">
          Better Luck Next Time
        </h1>
        <p className="text-2xl text-white/60">
          Don't worry, a special surprise is coming! 🎁
        </p>
        <div className="animate-pulse text-accent/80">
          Waiting for lucky air drop...
        </div>
      </motion.div>
    </div>
  );
};

export default LoserPage;