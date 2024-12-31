interface GameStatusProps {
  status: 'loading' | 'not-found';
}

export const GameStatus = ({ status }: GameStatusProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-muted-foreground">
        {status === 'loading' ? 'Loading game...' : 'Game not found. The game might have been completed or removed.'}
      </div>
    </div>
  );
};