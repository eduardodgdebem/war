import React from 'react';
import { Player } from '../types/types';
import { Shield } from 'lucide-react';

interface PlayerInfoProps {
  players: Player[];
  currentPlayerIndex: number;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ players, currentPlayerIndex }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-4">
      {players.map((player, index) => (
        <div 
          key={player.id}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full
            ${index === currentPlayerIndex ? 'ring-2 ring-white' : 'opacity-70'}
            ${player.eliminated ? 'line-through opacity-50' : ''}
          `}
          style={{ backgroundColor: player.color }}
        >
          <Shield size={18} className="text-white" />
          <span className="font-bold text-white">{player.name}</span>
          <span className="bg-black/30 px-2 py-0.5 rounded-full text-white text-sm">
            {player.territories} territories
          </span>
        </div>
      ))}
    </div>
  );
};

export default PlayerInfo;