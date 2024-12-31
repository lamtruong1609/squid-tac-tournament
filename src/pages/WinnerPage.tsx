import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const WinnerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Congratulations! 🎉",
      description: "Waiting for next match...",
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
        <h1 className="text-6xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            WINNER!
          </span>
        </h1>
        <p className="text-2xl text-white/80">
          Congratulations on your victory! 🏆
        </p>
        <p className="text-xl text-white/60">
          Preparing your next match...
        </p>
        <div className="animate-pulse text-primary/80">
          Please wait while we set up your next challenge
        </div>
      </motion.div>
    </div>
  );
};

export default WinnerPage;