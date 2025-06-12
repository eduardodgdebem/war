import { useReducer, useEffect } from "react";
import { GameState, GameAction, Player } from "../types/types";
import {
  initializeGame,
  isAdjacent,
  countPlayerTerritories,
  checkForWinner,
  simulateBattle,
} from "../utils/gameUtils";
import DoublyLinkedList from "../utils/doubleLinkedList";

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
        message: "Você só pode implantar tropas em seus próprios territórios",
      };
    }
    return {
      ...state,
      selectedTerritory: territory.id,
      message: "Implante uma tropa neste território"
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
        return { ...state, message: "Você precisa de pelo menos 2 tropas para atacar" };
      }
      return {
        ...state,
        selectedTerritory: territory.id,
        message: "Selecione um território inimigo para atacar",
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
        message: `Turno do ${state.currentPlayer?.name} - Selecione o território de onde atacar`,
      };
    }
    if (territory.owner === currentPlayerId) {
      return {
        ...state,
        selectedTerritory: null,
        message: "Você não pode atacar seus próprios territórios",
      };
    }
    if (!isAdjacent(sourceTerritory, territory)) {
      return {
        ...state,
        selectedTerritory: null,
        message: "Você só pode atacar territórios adjacentes",
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
      message: "Você só pode implantar tropas em seus próprios territórios",
    };
  }
  const updatedTerritories = [...state.territories];
  let troopsToDeploy = 1;
  if(state.cardSelected) {
    troopsToDeploy = state.currentPlayer?.cards.pop() || 1;
  }

  updatedTerritories[territoryIndex] = {
    ...territory,
    troops: territory.troops + troopsToDeploy,
  };
  return {
    ...state,
    territories: updatedTerritories,
    selectedTerritory: null,
    phase: "ATTACK",
    message: `${state.currentPlayer?.name} - Seu turno: selecione um território para atacar ou termine o turno`,
    cardSelected: false,
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
      message: "Você só pode atacar a partir dos seus próprios territórios",
    };
  }
  if (toTerritory.owner === currentPlayerId) {
    return { ...state, selectedTerritory: toTerritory.id };
  }
  if (fromTerritory.troops < 2) {
    return { ...state, message: "Você precisa de pelo menos 2 tropas para atacar" };
  }
  if (!isAdjacent(fromTerritory, toTerritory)) {
    return { ...state, message: "Você só pode atacar territórios adjacentes" };
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
    const message = `Ataque bem-sucedido! Conquistou o território em [${toTerritory.row},${toTerritory.col}]`;
    const updatedPlayers = countPlayerTerritories(
      updatedTerritories,
      state.players
    );
    const winner = checkForWinner(updatedPlayers.getList(), state.territories);
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
        message: `${winnerName} conquistou todos os territórios e venceu o jogo!`,
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
      message: `Ataque falhou! Perdeu tropas atacando [${toTerritory.row},${toTerritory.col}]`,
    };
  }
}

function getNextPlayer(state: GameState): Player | undefined {
  state.players.setCurrent((prev) => prev?.id === state.currentPlayer?.id);
  const nextPlayer = state.players.next();
  let tries = 0;
  while (state.players.getCurrent()?.eliminated) {
    state.players.next();
    if (++tries > state.players.getList().length) {
      return undefined;
    }
  }

  return nextPlayer;
}

function handleEndTurn(state: GameState): GameState {
  const nextPlayer = getNextPlayer(state);
  if (!nextPlayer) {
    return {
      ...state,
      currentPlayer: state.players.getCurrent(),
      selectedTerritory: null,
      phase: "GAME_OVER",
      message: "Todos os jogadores foram eliminados. Fim de jogo!",
      winner: null,
    };
  }

  const nextPlayerName = nextPlayer?.name;
  return {
    ...state,
    phase: "DEPLOY",
    selectedTerritory: null,
    currentPlayer: nextPlayer,
    message: `${nextPlayerName} - Seu turno: implante uma tropa`,
  };
}

function handleResetGame(action: GameAction): GameState | undefined {
  if (action.type !== "RESET_GAME") return;
  return initializeGame(action.playerCount);
}

const handleUndo = (state: GameState): GameState => {
  if (!state.history) return state;
  const previousState = state.history.undo();
  return previousState || state;
};

const handleRedo = (state: GameState): GameState => {
  if (!state.history) return state;
  const nextState = state.history.redo();
  return nextState || state;
};

const handleToggleCard = (state: GameState, action: GameAction): GameState => {
  if (action.type !== "SELECT_CARD") return state;
  return {
    ...state,
    cardSelected: action.cardSelected,
  };
}

const gameReducer = (state: GameState, action: GameAction): GameState => {
  let newState: GameState | undefined;

  if (action.type !== "UNDO" && action.type !== "REDO") {
    if (!state.history) {
      state.history = new DoublyLinkedList<GameState>();
    }
    state.history.push({ ...state });
  }

  switch (action.type) {
    case "UNDO":
      return handleUndo(state);
    case "REDO":
      return handleRedo(state);
    case "SELECT_TERRITORY":
      return handleSelectTerritory(state, action);
    case "DEPLOY_TROOP":
      return handleDeployTroop(state, action);
    case "ATTACK_TERRITORY":
      return handleAttackTerritory(state, action);
    case "END_TURN":
      return handleEndTurn(state);
    case "RESET_GAME":
      newState = handleResetGame(action);
      return newState ? newState : state;
    case "SELECT_CARD":
      return handleToggleCard(state, action);
    default:
      return state;
  }
};

export const useGame = (initialPlayerCount: number) => {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    initialPlayerCount,
    (count) => {
      const initialState = initializeGame(count);
      initialState.history = new DoublyLinkedList<GameState>();
      initialState.history.push(initialState);
      return initialState;
    }
  );

  useEffect(() => {}, [gameState]);

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

  const undo = () => {
    dispatch({ type: "UNDO" });
  };

  const redo = () => {
    dispatch({ type: "REDO" });
  };

  const selectCard = (cardSelected: boolean) => {
    dispatch({ type: "SELECT_CARD", cardSelected });
  }

  return {
    gameState,
    selectTerritory,
    deployTroop,
    attackTerritory,
    endTurn,
    resetGame,
    undo,
    redo,
    selectCard
  };
};
