import React from 'react';
import { Territory as TerritoryType } from '../types/types';

interface TerritoryProps {
  territory: TerritoryType;
  isSelected: boolean;
  isPossibleTarget: boolean;
  playerColor: string | null;
  onClick: () => void;
}

const Territory: React.FC<TerritoryProps> = ({
  territory,
  isSelected,
  isPossibleTarget,
  playerColor,
  onClick,
}) => {
  const getBorderStyles = () => {
    if (isSelected) {
      return 'border-4 border-white shadow-lg';
    }
    if (isPossibleTarget) {
      return 'border-2 border-white border-dashed animate-pulse';
    }
    return 'border border-gray-700';
  };

  return (
    <div
      className={`relative aspect-square w-full flex items-center justify-center rounded-md transition-all duration-200 hover:brightness-110 ${getBorderStyles()}`}
      style={{
        backgroundColor: playerColor || '#2A303C',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {/* Troop Count */}
      <div className="text-white font-bold text-lg md:text-xl relative z-10">
        {territory.troops}
      </div>
      
      {/* Territory Coordinates (for debugging) */}
      <div className="absolute bottom-0.5 right-0.5 text-xs text-white/50">
        {territory.row},{territory.col}
      </div>
      
      {/* Selected Highlight Effect */}
      {isSelected && (
        <div className="absolute inset-0 bg-white opacity-20 rounded-md"></div>
      )}
    </div>
  );
};

export default Territory;