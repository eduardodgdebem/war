import { GameState, Territory, PlayerId, Player } from '../types/types';
import CircularLikedList from './circularLikedList';

export const GRID_SIZE = 6;

export const PLAYER_COLORS = [
  '#FF5252', // Red
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Yellow
];

export const PLAYER_NAMES = [
  'Vermelho',
  'Verde',
  'Azul',
  'Amarelo',
];

export const isAdjacent = (t1: Territory, t2: Territory): boolean => {
  const rowDiff = Math.abs(t1.row - t2.row);
  const colDiff = Math.abs(t1.col - t2.col);
  
  return rowDiff <= 1 && colDiff <= 1;
};

export const initializePlayers = (playerCount: number): CircularLikedList<Player> => {
  const playersList = Array.from({ length: playerCount }, (_, i) => ({
    id: (i + 1) as PlayerId,
    name: PLAYER_NAMES[i],
    color: PLAYER_COLORS[i],
    territories: 0,
    eliminated: false,
    cards: getRandomCards(),
  }));

  return new CircularLikedList(playersList);
};

export const initializeTerritories = (playerCount: number): Territory[] => {
  const territories: Territory[] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const id = row * GRID_SIZE + col;
      territories.push({
        id,
        owner: null,
        troops: 0,
        row,
        col,
      });
    }
  }
  
  const totalTerritories = GRID_SIZE * GRID_SIZE;
  const shuffled = [...territories].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < totalTerritories; i++) {
    const playerId = ((i % playerCount) + 1) as PlayerId;
    shuffled[i].owner = playerId;
    shuffled[i].troops = 1;
  }
  
  return shuffled;
};

export const countPlayerTerritories = (territories: Territory[], players: CircularLikedList<Player>): CircularLikedList<Player> => {
  const updatedPlayers = players.getList().map(player => ({
    ...player,
    territories: 0,
    eliminated: true, 
  }));
  
  territories.forEach(territory => {
    if (territory.owner !== null) {
      const playerIndex = territory.owner - 1;
      updatedPlayers[playerIndex].territories += 1;
      updatedPlayers[playerIndex].eliminated = false;
    }
  });
  
  return new CircularLikedList(updatedPlayers);
};

export const checkForWinner = (players: Player[], territories: Territory[]): PlayerId | null => {
  const activePlayers = players.filter(player => !player.eliminated);
  
  if (activePlayers.length === 1) {
    return activePlayers[0].id;
  }

  const totalTerritories = territories.length;
  const playerTerritoryCount = new Map<PlayerId, number>();
  territories.forEach(territory => {
    if (territory.owner !== null) {
      playerTerritoryCount.set(territory.owner, (playerTerritoryCount.get(territory.owner) || 0) + 1);
    }
  });
  const winnerTreshold = Math.floor(totalTerritories * 0.75);
  for (const [playerId, count] of playerTerritoryCount.entries()) {
    if (count >= winnerTreshold) {
      return playerId;
    }
  }
  
  return null;
};

export const initializeGame = (playerCount: number): GameState => {
  const players = initializePlayers(playerCount);
  const territories = initializeTerritories(playerCount);
  
  const updatedPlayers = countPlayerTerritories(territories, players);
  
  return {
    players: updatedPlayers,
    currentPlayer: updatedPlayers.getCurrent(),
    territories,
    phase: 'DEPLOY',
    selectedTerritory: null,
    winner: null,
    message: `Turno do ${updatedPlayers.getCurrent()?.name} - Posicione tropas`,
    cardSelected: false,
  };
};

export const getNextPlayerIndex = (currentIndex: number, players: Player[]): number => {
  let nextIndex = (currentIndex + 1) % players.length;
  
  while (players[nextIndex].eliminated && nextIndex !== currentIndex) {
    nextIndex = (nextIndex + 1) % players.length;
  }
  
  return nextIndex;
};

export const simulateBattle = (attackerTroops: number, defenderTroops: number): boolean => {
  const attackerStrength = Math.random() * attackerTroops;
  const defenderStrength = Math.random() * defenderTroops;
  
  return attackerStrength > defenderStrength;
};

export const getRandomCards = (): number[] => {
  const possibleCards = [1, 2, 3, 5, 8];
  return [...possibleCards].sort(() => Math.random() - 0.5);
}