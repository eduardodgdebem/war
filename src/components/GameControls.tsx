import { GameState } from '../types/types';
import { Flag, Sword, SkipForward, RefreshCw } from 'lucide-react';

interface GameControlsProps {
  gameState: GameState;
  onEndTurn: () => void;
  onResetGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onEndTurn,
  onResetGame,
}) => {
  const { phase, players, winner } = gameState;
  
  if (phase === 'GAME_OVER') {
    const winnerPlayer = players.getList().find(p => p.id === winner);
    
    return (
      <div className="flex flex-col items-center gap-4 my-6">
        <div 
          className="text-2xl font-bold px-6 py-3 rounded-lg"
          style={{ backgroundColor: winnerPlayer?.color }}
        >
          <span className="text-white">{winnerPlayer?.name} Wins!</span>
        </div>
        
        <button
          onClick={() => onResetGame()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          <RefreshCw size={20} />
          Play Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 my-4">
      <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
        {phase === 'DEPLOY' ? (
          <Flag size={20} className="text-yellow-400" />
        ) : (
          <Sword size={20} className="text-red-400" />
        )}
        <span className="font-semibold text-white">
          {phase === 'DEPLOY' ? 'Deploy Phase' : 'Attack Phase'}
        </span>
      </div>
      
      {phase === 'ATTACK' && (
        <button
          onClick={onEndTurn}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <SkipForward size={20} />
          End Turn
        </button>
      )}
      
      <button
        onClick={() => onResetGame()}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <RefreshCw size={20} />
        Reset Game
      </button>
    </div>
  );
};

export default GameControls;