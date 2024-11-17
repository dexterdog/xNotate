import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export const NewGame = () => {
  const { setCurrentGame, user } = useStore();
  const [gameDetails, setGameDetails] = useState({
    white: '',
    black: '',
    event: '',
    site: '',
    round: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGame = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...gameDetails,
      result: '*',
      moves: [],
      pgn: '',
      timestamp: Date.now(),
      userId: user?.id || ''
    };
    setCurrentGame(newGame);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">New Game</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">White</label>
          <input
            type="text"
            value={gameDetails.white}
            onChange={(e) => setGameDetails({ ...gameDetails, white: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
            placeholder={user?.name || ''}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Black</label>
          <input
            type="text"
            value={gameDetails.black}
            onChange={(e) => setGameDetails({ ...gameDetails, black: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
            placeholder={user?.name || ''}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Event</label>
          <input
            type="text"
            value={gameDetails.event}
            onChange={(e) => setGameDetails({ ...gameDetails, event: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
            placeholder="Tournament, Casual, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Site</label>
          <input
            type="text"
            value={gameDetails.site}
            onChange={(e) => setGameDetails({ ...gameDetails, site: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
            placeholder="Location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Round</label>
          <input
            type="text"
            value={gameDetails.round}
            onChange={(e) => setGameDetails({ ...gameDetails, round: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-4 py-2"
            placeholder="1"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          Start Game
        </button>
      </form>
    </div>
  );
};