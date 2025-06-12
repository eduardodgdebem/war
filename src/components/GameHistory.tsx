import React from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { GameState } from '../types/types';

interface GameHistoryProps {
  onUndo: () => void;
  onRedo: () => void;
  gameState: GameState;
}

const GameHistory: React.FC<GameHistoryProps> = ({ onUndo, onRedo, gameState }) => {
  const canUndo = gameState.history?.current?.prev !== null;
  const canRedo = gameState.history?.current?.next !== null;

  return (
    <div className="flex items-center justify-center gap-2 my-4">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
          ${canUndo 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
        `}
        title="Undo last move"
      >
        <RotateCcw size={18} />
        Desfazer
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
          ${canRedo 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
        `}
        title="Redo last move"
      >
        <RotateCw size={18} />
        Refazer
      </button>
    </div>
  );
};

export default GameHistory;