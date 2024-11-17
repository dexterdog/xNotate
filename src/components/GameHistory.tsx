import React, { useState } from 'react';
import { format } from 'date-fns';
import { Download, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ConfirmModal } from './ConfirmModal';
import { toast } from 'react-hot-toast';
import { Game } from '../types';

export const GameHistory = () => {
  const { games, deleteGame, user } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Sort games by timestamp in descending order (most recent first)
  const sortedGames = [...games]
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter(game => game.white === user?.name || game.black === user?.name);

  const handleDelete = async () => {
    if (selectedGameId) {
      await deleteGame(selectedGameId);
      setShowDeleteConfirm(false);
      setSelectedGameId(null);
      toast.success('Game deleted successfully');
    }
  };

  const exportToLichess = (pgn: string) => {
    const lichessUrl = `https://lichess.org/analysis/pgn/${encodeURIComponent(pgn)}`;
    window.open(lichessUrl, '_blank');
  };

  const exportToChessCom = (pgn: string) => {
    const chessComUrl = `https://chess.com/analysis?pgn=${encodeURIComponent(pgn)}`;
    window.open(chessComUrl, '_blank');
  };

  const downloadPGN = (game: Game) => {
    const blob = new Blob([game.pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.white}-vs-${game.black}-${format(game.timestamp, 'yyyy-MM-dd')}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Game History</h3>
      <div className="space-y-4">
        {sortedGames.map(game => (
          <div key={game.id} className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className={`font-medium ${game.white === user?.name ? 'text-amber-600' : ''}`}>
                  {game.white}
                </span>
                <span className="mx-2">vs</span>
                <span className={`font-medium ${game.black === user?.name ? 'text-amber-600' : ''}`}>
                  {game.black}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {format(game.timestamp, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Result: {game.result}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => exportToLichess(game.pgn)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#4c4c4c] hover:bg-[#3c3c3c] text-white rounded-md shadow-sm transition-colors"
                  title="Analyze in Lichess"
                >
                  <img 
                    src="https://lichess1.org/assets/logo/lichess-white.svg" 
                    alt="Lichess" 
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">Lichess</span>
                </button>
                <button
                  onClick={() => exportToChessCom(game.pgn)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#769656] hover:bg-[#567142] text-white rounded-md shadow-sm transition-colors"
                  title="Analyze in Chess.com"
                >
                  <img 
                    src="https://www.chess.com/favicon.ico" 
                    alt="Chess.com" 
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">Chess.com</span>
                </button>
                <button
                  onClick={() => downloadPGN(game)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Download PGN"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => {
                    setSelectedGameId(game.id);
                    setShowDeleteConfirm(true);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Game"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sortedGames.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No games recorded yet.
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedGameId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Game"
        message="Are you sure you want to delete this game? This action cannot be undone."
      />
    </div>
  );
};