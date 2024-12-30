import { motion } from "framer-motion";

interface WaitingPlayersProps {
  players: string[];
}

const WaitingPlayers = ({ players }: WaitingPlayersProps) => {
  return (
    <div className="mt-8 p-4 bg-background/30 backdrop-blur-sm rounded-lg border border-primary/30 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-primary">
        Players Waiting: {players.length}
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {players.map((player, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-2 rounded-md bg-secondary/50"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold">
              {index + 1}
            </span>
            <span className="text-foreground">{player}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WaitingPlayers;