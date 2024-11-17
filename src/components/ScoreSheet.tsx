import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { toast } from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { ChessBoard } from './ChessBoard';
import { LayoutDashboard, Clock, Trophy, Undo2, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const ScoreSheet = () => {
  const [moveInput, setMoveInput] = useState('');
  const [showBoard, setShowBoard] = useState(false);
  const [chessInstance] = useState(new Chess());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingResult, setPendingResult] = useState<string | null>(null);
  const inputTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { currentGame, addMove, undoLastMove, finishGame } = useStore();

  useEffect(() => {
    chessInstance.reset();
    if (currentGame?.moves) {
      currentGame.moves.forEach(move => {
        try {
          chessInstance.move(move);
        } catch (error) {
          console.error(`Invalid move: ${move}`);
        }
      });
    }
  }, [currentGame?.moves]);

  const normalizeMove = (move: string): string => {
    // Remove move numbers and whitespace
    let normalized = move.trim().replace(/^\d+\.+\s*/, '');
    
    // Handle castling notation
    if (/^[oO0]-?[oO0](-[oO0])?$/i.test(normalized)) {
      return normalized.toUpperCase().replace(/0/g, 'O').replace(/\s+/g, '');
    }

    // Convert to proper case (e.g., e4, Nf3)
    normalized = normalized.toLowerCase();
    if (/^[nbrqk]/i.test(normalized)) {
      normalized = normalized[0].toUpperCase() + normalized.slice(1);
    }

    return normalized;
  };

  const submitMove = (move: string): boolean => {
    if (!move.trim()) return false;

    try {
      const normalizedMove = normalizeMove(move);
      const possibleMoves = chessInstance.moves({ verbose: true });
      
      // Find matching move in possible moves
      const matchingMove = possibleMoves.find(m => 
        m.san.toLowerCase() === normalizedMove.toLowerCase() ||
        m.lan.toLowerCase() === normalizedMove.toLowerCase()
      );

      if (matchingMove) {
        const result = chessInstance.move(matchingMove.san);
        if (result) {
          addMove(result.san);
          setMoveInput('');
          toast.success('Move recorded');
          return true;
        }
      }

      toast.error('Invalid move');
      return false;
    } catch (error) {
      console.error('Move error:', error);
      toast.error('Invalid move');
      return false;
    }
  };

  const handleMoveInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMove = e.target.value;
    setMoveInput(newMove);

    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }

    if (newMove.trim()) {
      inputTimeoutRef.current = setTimeout(() => {
        submitMove(newMove);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && moveInput.trim()) {
      if (inputTimeoutRef.current) {
        clearTimeout(inputTimeoutRef.current);
      }
      submitMove(moveInput);
    }
  };

  const handleUndo = () => {
    if (!currentGame?.moves.length) {
      toast.error('No moves to undo');
      return;
    }
    chessInstance.undo();
    undoLastMove();
    toast.success('Move undone');
  };

  const handleGameEnd = async (result: string) => {
    setPendingResult(result);
    setShowConfirmModal(true);
  };

  const confirmGameEnd = async () => {
    if (!pendingResult || !currentGame) return;

    const pgn = chessInstance.pgn();
    await finishGame(pendingResult, pgn);
    toast.success('Game completed!');
    setShowConfirmModal(false);
  };

  const getMoveNumber = (index: number) => Math.floor(index / 2) + 1;

  if (!currentGame) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {currentGame.white} vs {currentGame.black}
        </h2>
        <div className="flex gap-4">
          <button
            onClick={handleUndo}
            disabled={!currentGame.moves.length}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors
              ${currentGame.moves.length 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <Undo2 size={18} />
            Undo Last Move
          </button>
          <button 
            onClick={() => setShowBoard(!showBoard)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <LayoutDashboard size={18} />
            {showBoard ? 'Hide Board' : 'View Board'}
          </button>
        </div>
      </div>

      {showBoard && (
        <div className="mb-6">
          <div className="relative bg-white rounded-lg shadow-lg p-4">
            <button
              onClick={() => setShowBoard(false)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <ChessBoard game={chessInstance} />
          </div>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={moveInput}
          onChange={handleMoveInput}
          onKeyPress={handleKeyPress}
          placeholder="Enter move (e.g., e4, Nf3) - Auto-submits after 2 seconds"
          className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">White: {currentGame.white}</h3>
          {currentGame.moves
            .filter((_, i) => i % 2 === 0)
            .map((move, i) => (
              <div key={i} className="text-lg">
                {getMoveNumber(i * 2)}. {move}
              </div>
            ))}
        </div>
        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Black: {currentGame.black}</h3>
          {currentGame.moves
            .filter((_, i) => i % 2 === 1)
            .map((move, i) => (
              <div key={i} className="text-lg">
                {move}
              </div>
            ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={() => handleGameEnd('1-0')}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Trophy size={20} />
          White Won
        </button>
        <button 
          onClick={() => handleGameEnd('1/2-1/2')}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <Clock size={20} />
          Draw
        </button>
        <button 
          onClick={() => handleGameEnd('0-1')}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900"
        >
          <Trophy size={20} />
          Black Won
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmGameEnd}
        title="End Game"
        message="Are you sure you want to end this game? This action cannot be undone."
      />
    </div>
  );
};