import React, { useState } from 'react';
import { Users } from 'lucide-react';

interface PlayerSetupProps {
  onStartGame: (playerCount: number) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(2);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-600 rounded-full">
            <Users size={40} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">War</h1>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2 text-center">
            Selecione o número de jogadores
          </label>
          <div className="flex justify-center gap-4">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => setPlayerCount(count)}
                className={`
                  px-6 py-3 rounded-lg font-bold transition-all 
                  ${playerCount === count 
                    ? 'bg-blue-600 scale-105 shadow-lg' 
                    : 'bg-gray-700 hover:bg-gray-600'}
                `}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => onStartGame(playerCount)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Começar o Jogo
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetup;