import React, { useState } from 'react';
import Board from './Board';
import PlayerInfo from './PlayerInfo';
import GameControls from './GameControls';
import PlayerSetup from './PlayerSetup';
import { useGame } from '../hooks/useGame';
import { Territory } from '../types/types';
import { Shield, AlertTriangle } from 'lucide-react';

const DEFAULT_PLAYER_COUNT = 2;

const Game: React.FC = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYER_COUNT);
  const { gameState, selectTerritory, deployTroop, attackTerritory, endTurn, resetGame } = useGame(playerCount);
  
  const handleTerritoryClick = (territory: Territory) => {
    const { selectedTerritory, phase } = gameState;
    
    if (selectedTerritory === null) {
      selectTerritory(territory.id);
      return;
    }
    
    if (phase === 'DEPLOY' && selectedTerritory === territory.id) {
      deployTroop(territory.id);
      return;
    }
    
    if (phase === 'ATTACK' && selectedTerritory !== null && selectedTerritory !== territory.id) {
      attackTerritory(selectedTerritory, territory.id);
      return;
    }
    
    selectTerritory(territory.id);
  };
  
  const handleStartGame = (count: number) => {
    setPlayerCount(count);
    resetGame(count);
    setIsGameStarted(true);
  };
  
  const handleResetGame = () => {
    setIsGameStarted(false);
  };
  
  if (!isGameStarted) {
    return <PlayerSetup onStartGame={handleStartGame} />;
  }
  
  const { players, currentPlayerIndex, message, phase } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  
  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Shield className="text-blue-400" />
          War Game
        </h1>
        <p className="text-gray-400">Conquer territories and defeat your enemies!</p>
      </header>
      
      <PlayerInfo 
        players={players}
        currentPlayerIndex={currentPlayerIndex}
      />
      
      <div className="mb-4 p-3 bg-gray-800 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentPlayer.color }}
          ></div>
          <p className="text-white font-medium">{message}</p>
        </div>
      </div>
      
      <Board 
        gameState={gameState}
        onTerritoryClick={handleTerritoryClick}
      />
      
      <GameControls
        gameState={gameState}
        onEndTurn={endTurn}
        onResetGame={handleResetGame}
      />
      
      <div className="mt-auto p-3 bg-gray-800 rounded-lg">
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-yellow-400" />
          <div>
            <p><strong>How to play:</strong> First deploy one troop to your territory, then attack adjacent enemy territories. After attacking, end your turn.</p>
            <p className="mt-1"><strong>Winning:</strong> Eliminate all other players by conquering their territories.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;