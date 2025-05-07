import { useReducer, useEffect } from "react";
import { GameState, GameAction } from "../types/types";
import {
  initializeGame,
  isAdjacent,
  countPlayerTerritories,
  checkForWinner,
  simulateBattle,
} from "../utils/gameUtils";

function handleSelectTerritory(
  state: GameState,
  action: GameAction
): GameState {
  if (action.type !== "SELECT_TERRITORY") return state;
  const territory = state.territories.find((t) => t.id === action.territoryId);
  const currentPlayerId = state.currentPlayer?.id;
  if (!territory) return state;

  if (state.phase === "DEPLOY") {
    if (territory.owner !== currentPlayerId) {
      return {
        ...state,
        message: "You can only deploy troops to your own territories",
      };
    }
    return {
      ...state,
      selectedTerritory: territory.id,
      message: "Deploy a troop to this territory",
    };
  }

  if (state.phase === "ATTACK") {
    if (state.selectedTerritory === null) {
      if (territory.owner !== currentPlayerId) {
        return {
          ...state,
          message: "You can only attack from your own territories",
        };
      }
      if (territory.troops < 2) {
        return { ...state, message: "You need at least 2 troops to attack" };
      }
      return {
        ...state,
        selectedTerritory: territory.id,
        message: "Select an enemy territory to attack",
      };
    }

    const sourceTerritory = state.territories.find(
      (t) => t.id === state.selectedTerritory
    );
    if (!sourceTerritory) return state;
    if (territory.id === sourceTerritory.id) {
      return {
        ...state,
        selectedTerritory: null,
        message: `${state.currentPlayer?.name}'s turn - Select territory to attack from`,
      };
    }
    if (territory.owner === currentPlayerId) {
      return {
        ...state,
        selectedTerritory: null,
        message: "You cannot attack your own territories",
      };
    }
    if (!isAdjacent(sourceTerritory, territory)) {
      return {
        ...state,
        selectedTerritory: null,
        message: "You can only attack adjacent territories",
      };
    }
    return { ...state, selectedTerritory: null };
  }

  return {
    ...state,
    selectedTerritory: territory.id,
    message: "Deploy a troop to this territory",
  };
}

function handleDeployTroop(state: GameState, action: GameAction): GameState {
  if (state.phase !== "DEPLOY" || action.type !== "DEPLOY_TROOP") return state;
  const currentPlayerId = state.currentPlayer!.id;
  const territoryIndex = state.territories.findIndex(
    (t) => t.id === action.territoryId
  );
  if (territoryIndex === -1) return state;
  const territory = state.territories[territoryIndex];
  if (territory.owner !== currentPlayerId) {
    return {
      ...state,
      message: "You can only deploy troops to your own territories",
    };
  }
  const updatedTerritories = [...state.territories];
  updatedTerritories[territoryIndex] = {
    ...territory,
    troops: territory.troops + 3,
  };
  return {
    ...state,
    territories: updatedTerritories,
    selectedTerritory: null,
    phase: "ATTACK",
    message: `${state.currentPlayer?.name}'s turn - Select territory to attack from or end turn`,
  };
}

function handleAttackTerritory(
  state: GameState,
  action: GameAction
): GameState {
  if (state.phase !== "ATTACK" || action.type !== "ATTACK_TERRITORY")
    return state;
  const fromIndex = state.territories.findIndex((t) => t.id === action.fromId);
  const toIndex = state.territories.findIndex((t) => t.id === action.toId);
  if (fromIndex === -1 || toIndex === -1) return state;
  const fromTerritory = state.territories[fromIndex];
  const toTerritory = state.territories[toIndex];
  const currentPlayerId = state.currentPlayer?.id;

  if (fromTerritory.owner !== currentPlayerId) {
    return {
      ...state,
      message: "You can only attack from your own territories",
    };
  }
  if (toTerritory.owner === currentPlayerId) {
    return { ...state, selectedTerritory: toTerritory.id };
  }
  if (fromTerritory.troops < 2) {
    return { ...state, message: "You need at least 2 troops to attack" };
  }
  if (!isAdjacent(fromTerritory, toTerritory)) {
    return { ...state, message: "You can only attack adjacent territories" };
  }

  const attackSuccess = simulateBattle(
    fromTerritory.troops,
    toTerritory.troops
  );
  const updatedTerritories = [...state.territories];

  if (attackSuccess) {
    updatedTerritories[toIndex] = {
      ...toTerritory,
      owner: currentPlayerId,
      troops: Math.floor(fromTerritory.troops / 2),
    };
    updatedTerritories[fromIndex] = {
      ...fromTerritory,
      troops: Math.ceil(fromTerritory.troops / 2),
    };
    const message = `Attack successful! Conquered territory at [${toTerritory.row},${toTerritory.col}]`;
    const updatedPlayers = countPlayerTerritories(
      updatedTerritories,
      state.players
    );
    const winner = checkForWinner(updatedPlayers.getList());
    if (winner !== null) {
      const winnerName = updatedPlayers
        .getList()
        .find((p) => p.id === winner)?.name;
      return {
        ...state,
        territories: updatedTerritories,
        players: updatedPlayers,
        winner,
        phase: "GAME_OVER",
        message: `${winnerName} has conquered all territories and won the game!`,
      };
    }
    return {
      ...state,
      territories: updatedTerritories,
      players: updatedPlayers,
      message,
    };
  } else {
    updatedTerritories[fromIndex] = {
      ...fromTerritory,
      troops: fromTerritory.troops - 1,
    };
    updatedTerritories[toIndex] = {
      ...toTerritory,
      troops: toTerritory.troops - 1 > 0 ? toTerritory.troops - 1 : 1,
    };
    return {
      ...state,
      territories: updatedTerritories,
      message: `Attack failed! Lost troops attacking [${toTerritory.row},${toTerritory.col}]`,
    };
  }
}

function handleEndTurn(state: GameState): GameState {
  state.players.setCurrent((prev) => prev?.id === state.currentPlayer?.id);
  const nextPlayer = state.players.next();
  let tries = 0;
  while (state.players.getCurrent()?.eliminated) {
    state.players.next();
    if (++tries > state.players.getList().length) {
      return {
        ...state,
        currentPlayer: state.players.getCurrent(),
        selectedTerritory: null,
        phase: "GAME_OVER",
        message: "All players have been eliminated. Game over!",
        winner: null,
      };
    }
  }
  const nextPlayerName = nextPlayer?.name;
  return {
    ...state,
    phase: "DEPLOY",
    selectedTerritory: null,
    currentPlayer: nextPlayer,
    message: `${nextPlayerName}'s turn - Deploy a troop`,
  };
}

function handleResetGame(action: GameAction): GameState | undefined {
  if (action.type !== "RESET_GAME") return;
  return initializeGame(action.playerCount);
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SELECT_TERRITORY":
      return handleSelectTerritory(state, action);
    case "DEPLOY_TROOP":
      return handleDeployTroop(state, action);
    case "ATTACK_TERRITORY":
      return handleAttackTerritory(state, action);
    case "END_TURN":
      return handleEndTurn(state);
    case "RESET_GAME":
      const newState = handleResetGame(action);
      return newState ? newState : state;
    default:
      return state;
  }
};

export const useGame = (initialPlayerCount: number) => {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    initialPlayerCount,
    initializeGame
  );

  useEffect(() => {
  }, [gameState]);

  const selectTerritory = (territoryId: number) => {
    dispatch({ type: "SELECT_TERRITORY", territoryId });
  };

  const deployTroop = (territoryId: number) => {
    dispatch({ type: "DEPLOY_TROOP", territoryId });
  };

  const attackTerritory = (fromId: number, toId: number) => {
    dispatch({ type: "ATTACK_TERRITORY", fromId, toId });
  };

  const endTurn = () => {
    dispatch({ type: "END_TURN" });
  };

  const resetGame = (playerCount: number) => {
    dispatch({ type: "RESET_GAME", playerCount });
  };

  return {
    gameState,
    selectTerritory,
    deployTroop,
    attackTerritory,
    endTurn,
    resetGame,
  };
};
