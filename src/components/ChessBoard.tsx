import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface ChessBoardProps {
  game: Chess;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ game }) => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [positions, setPositions] = useState<string[]>([]);
  const [hasThreefoldRepetition, setHasThreefoldRepetition] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [chessInstance] = useState(new Chess());

  const updatePositions = () => {
    // Reset the chess instance and replay all moves
    chessInstance.reset();
    const moves = game.history();
    moves.forEach(move => {
      try {
        chessInstance.move(move);
      } catch (error) {
        console.error(`Error replaying move: ${move}`, error);
      }
    });

    const newPositions = [new Chess().fen()];
    const tempGame = new Chess();
    moves.forEach(move => {
      tempGame.move(move);
      newPositions.push(tempGame.fen());
    });
    
    setPositions(newPositions);
    setCurrentPosition(newPositions.length - 1);
    
    // Check for threefold repetition
    const positionCount = new Map<string, number>();
    newPositions.forEach(fen => {
      const positionPart = fen.split(' ').slice(0, 4).join(' ');
      positionCount.set(positionPart, (positionCount.get(positionPart) || 0) + 1);
    });
    
    setHasThreefoldRepetition(Array.from(positionCount.values()).some(count => count >= 3));
  };

  // Update positions whenever the game changes
  useEffect(() => {
    updatePositions();
  }, [game.history().length]);

  const goToMove = (moveNum: number) => {
    setCurrentPosition(moveNum);
  };

  const getCurrentMoveNumber = () => {
    return Math.floor((currentPosition + 1) / 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Flip Board
        </button>
      </div>

      <div className="w-full max-w-[600px] mx-auto">
        <Chessboard 
          position={positions[currentPosition]}
          boardWidth={600}
          boardOrientation={boardOrientation}
          areArrowsAllowed={false}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
          }}
        />
      </div>

      {hasThreefoldRepetition && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
          <AlertTriangle size={20} />
          <span>Threefold repetition detected!</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => goToMove(0)}
          disabled={currentPosition === 0}
          className={`px-3 py-1 rounded ${
            currentPosition === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          Start
        </button>
        <button
          onClick={() => goToMove(Math.max(0, currentPosition - 1))}
          disabled={currentPosition === 0}
          className={`p-2 rounded ${
            currentPosition === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-medium">
          Move {getCurrentMoveNumber()}
        </span>
        <button
          onClick={() => goToMove(Math.min(positions.length - 1, currentPosition + 1))}
          disabled={currentPosition === positions.length - 1}
          className={`p-2 rounded ${
            currentPosition === positions.length - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => goToMove(positions.length - 1)}
          disabled={currentPosition === positions.length - 1}
          className={`px-3 py-1 rounded ${
            currentPosition === positions.length - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          End
        </button>
      </div>
    </div>
  );
};