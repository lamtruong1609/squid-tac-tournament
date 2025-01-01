export const calculateWinner = (board: (string | null)[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

export const calculateRPSWinner = (
  p1Choice: 'rock' | 'paper' | 'scissors',
  p2Choice: 'rock' | 'paper' | 'scissors',
  p1Id: string,
  p2Id: string
): string | 'draw' => {
  if (p1Choice === p2Choice) {
    return 'draw';
  }

  const winningCombos = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };

  return winningCombos[p1Choice] === p2Choice ? p1Id : p2Id;
};