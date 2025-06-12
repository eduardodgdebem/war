import CircularLikedList from "../utils/circularLikedList";
import DoublyLinkedList from '../utils/doubleLinkedList';

export type PlayerId = 1 | 2 | 3 | 4;

export interface Player {
  id: PlayerId;
  name: string;
  color: string;
  territories: number;
  eliminated: boolean;
  cards: number[];
}

export interface Territory {
  id: number;
  owner: PlayerId | null;
  troops: number;
  row: number;
  col: number;
}

export interface GameState {
  players: CircularLikedList<Player>;
  currentPlayer?: Player;
  territories: Territory[];
  phase: 'DEPLOY' | 'ATTACK' | 'GAME_OVER';
  selectedTerritory: number | null;
  winner: PlayerId | null;
  message: string;
  history?: DoublyLinkedList<GameState>;
  cardSelected: boolean;
}

export type GameAction = 
  | { type: 'SELECT_TERRITORY'; territoryId: number }
  | { type: 'DEPLOY_TROOP'; territoryId: number }
  | { type: 'ATTACK_TERRITORY'; fromId: number; toId: number }
  | { type: 'END_TURN' }
  | { type: 'RESET_GAME'; playerCount: number }
  | { type: 'SELECT_CARD'; cardSelected: boolean }
  | { type: 'UNDO'; }
  | { type: 'REDO'; }