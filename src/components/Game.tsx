import React, { useState } from 'react';
import Board from './Board';
import PlayerInfo from './PlayerInfo';
import GameControls from './GameControls';
import PlayerSetup from './PlayerSetup';
import GameHistory from './GameHistory';
import { useGame } from '../hooks/useGame';
import { Territory } from '../types/types';
import { Shield, AlertTriangle } from 'lucide-react';

const DEFAULT_PLAYER_COUNT = 2;

const Game: React.FC = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYER_COUNT);
  const { 
    gameState, 
    selectTerritory, 
    deployTroop, 
    attackTerritory, 
    endTurn, 
    resetGame,
    undo,
    redo 
  } = useGame(playerCount);
  
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
  
  const { players, currentPlayer, message } = gameState;
  
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Shield className="text-blue-400" />
          War Game
        </h1>
        <p className="text-gray-400">Conquer territories and defeat your enemies!</p>
      </header>
      
      <PlayerInfo 
        players={players}
        currentPlayer={currentPlayer}
      />
      
      <div className="mb-4 p-3 bg-gray-800 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentPlayer?.color }}
          ></div>
          <p className="text-white font-medium">{message}</p>
        </div>
      </div>
      
      <GameHistory 
        gameState={gameState}
        onUndo={undo}
        onRedo={redo}
      />
      
      <Board 
        gameState={gameState}
        onTerritoryClick={handleTerritoryClick}
      />
      
      <GameControls
        gameState={gameState}
        onEndTurn={endTurn}
        onResetGame={handleResetGame}
      />
    </div>
  );
};

export default Game;