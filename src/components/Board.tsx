import Territory from './Territory';
import { Territory as TerritoryType, GameState } from '../types/types';
import { GRID_SIZE, isAdjacent } from '../utils/gameUtils';

interface BoardProps {
  gameState: GameState;
  onTerritoryClick: (territory: TerritoryType) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onTerritoryClick }) => {
  const { territories, players, currentPlayer, selectedTerritory, phase } = gameState;
  const currentPlayerId = currentPlayer?.id;
  
  // Helper to get player color by ID
  const getPlayerColor = (playerId: number | null) => {
    if (playerId === null) return null;
    const player = players.getList().find(p => p.id === playerId);
    return player ? player.color : null;
  };
  
  // Check if a territory is a valid attack target
  const isPossibleTarget = (territory: TerritoryType) => {
    if (phase !== 'ATTACK' || selectedTerritory === null) return false;
    
    const sourceTerritory = territories.find(t => t.id === selectedTerritory);
    if (!sourceTerritory) return false;
    
    return (
      territory.owner !== currentPlayerId &&
      sourceTerritory.owner === currentPlayerId &&
      isAdjacent(sourceTerritory, territory) &&
      sourceTerritory.troops >= 2
    );
  };
  
  // Generate grid items
  const renderGrid = () => {
    const grid = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const territory = territories.find(t => t.row === row && t.col === col);
        
        if (!territory) continue;
        
        const isSelected = selectedTerritory === territory.id;
        const playerColor = getPlayerColor(territory.owner);
        
        grid.push(
          <Territory
            key={territory.id}
            territory={territory}
            isSelected={isSelected}
            isPossibleTarget={isPossibleTarget(territory)}
            playerColor={playerColor}
            onClick={() => onTerritoryClick(territory)}
          />
        );
      }
    }
    
    return grid;
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 p-4 rounded-lg shadow-lg">
      <div 
        className="grid gap-1"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, 
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` 
        }}
      >
        {renderGrid()}
      </div>
    </div>
  );
};

export default Board;