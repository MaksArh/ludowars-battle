interface GameMenuProps {
  onStartGame?: () => void;
  onShowSettings?: () => void;
}

export const GameMenu = ({ onStartGame, onShowSettings }: GameMenuProps) => {
  return (
    <div className="game-menu">
      <h2>Main Menu</h2>
      <button onClick={onStartGame}>Start Game</button>
      <button onClick={onShowSettings}>Settings</button>
    </div>
  );
};
