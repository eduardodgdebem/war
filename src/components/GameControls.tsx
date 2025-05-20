import { useEffect, useState } from "react";
import { GameState } from "../types/types";
import { Flag, Sword, SkipForward, RefreshCw } from "lucide-react";

interface GameControlsProps {
  gameState: GameState;
  onEndTurn: () => void;
  onResetGame: () => void;
  onSelectCard: (cardSelected: boolean) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onEndTurn,
  onResetGame,
  onSelectCard,
}) => {
  const { phase, players, winner, currentPlayer, cardSelected } = gameState;

  const getCardStyle = (cardsLength: number, index: number) => {
    let style = "";
    if (cardsLength - 1 !== index) {
      style += " opacity-70 pointer-events-none";
    } else if (cardSelected) {
      style += " border-2 border-white";
    }
    return style;
  };

  if (phase === "GAME_OVER") {
    const winnerPlayer = players.getList().find((p) => p.id === winner);

    return (
      <div className="flex flex-col items-center gap-4 my-6">
        <div
          className="text-2xl font-bold px-6 py-3 rounded-lg"
          style={{ backgroundColor: winnerPlayer?.color }}
        >
          <span className="text-white">{winnerPlayer?.name} Wins!</span>
        </div>

        <button
          onClick={() => onResetGame()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          <RefreshCw size={20} />
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-6">
      {phase === "DEPLOY" && (
        <div>
          {currentPlayer?.cards.map((card, index) => (
            <button
              key={index}
              className={`inline-block bg-gray-700 border-2 border-gray-700 text-white px-2 py-1 rounded-lg mr-2 mb-2 min-w-14 text-center ${getCardStyle(
                currentPlayer.cards.length,
                index
              )}`}
              onClick={() => onSelectCard(!gameState.cardSelected)}
            >
              +{card}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 my-4">
        <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
          {phase === "DEPLOY" ? (
            <Flag size={20} className="text-yellow-400" />
          ) : (
            <Sword size={20} className="text-red-400" />
          )}
          <span className="font-semibold text-white">
            {phase === "DEPLOY" ? "Posicionar Tropas " : "Atacar Territórios "}
          </span>
        </div>

        {phase === "ATTACK" && (
          <button
            onClick={onEndTurn}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <SkipForward size={20} />
            Terminar Turno
          </button>
        )}

        <button
          onClick={() => onResetGame()}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
          Resetar o Jogo
        </button>
      </div>
    </div>
  );
};

export default GameControls;
