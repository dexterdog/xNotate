import React from 'react';
import { format } from 'date-fns';
import { Trophy, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { GameHistory } from './GameHistory';

export const Stats = () => {
  const { user, games } = useStore();

  if (!user || !games.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No games recorded yet.</p>
      </div>
    );
  }

  const totalGames = games.length;
  const whiteGames = games.filter(g => g.white === user.name);
  const blackGames = games.filter(g => g.black === user.name);
  
  const whiteWins = whiteGames.filter(g => g.result === '1-0').length;
  const blackWins = blackGames.filter(g => g.result === '0-1').length;
  const draws = games.filter(g => g.result === '1/2-1/2').length;
  
  const whiteWinRate = (whiteWins / whiteGames.length) * 100 || 0;
  const blackWinRate = (blackWins / blackGames.length) * 100 || 0;
  const drawRate = (draws / totalGames) * 100 || 0;

  const getStreak = () => {
    let streak = 0;
    const sortedGames = [...games].sort((a, b) => b.timestamp - a.timestamp);
    
    for (const game of sortedGames) {
      const isWin = (game.white === user.name && game.result === '1-0') ||
                   (game.black === user.name && game.result === '0-1');
      if (isWin) streak++;
      else break;
    }
    return streak;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">As White</h3>
            <Trophy className="text-amber-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-amber-600">{whiteWinRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Win rate as White</p>
          <p className="mt-2">Wins: {whiteWins} / Games: {whiteGames.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">As Black</h3>
            <Trophy className="text-gray-800" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{blackWinRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Win rate as Black</p>
          <p className="mt-2">Wins: {blackWins} / Games: {blackGames.length}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Draws</h3>
            <Clock className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-600">{drawRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Draw rate</p>
          <p className="mt-2">Draws: {draws} / Total: {totalGames}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Current Streak</h3>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">{getStreak()}</p>
          <p className="text-sm text-gray-500">Consecutive wins</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Games</h3>
            <Calendar className="text-purple-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-600">{totalGames}</p>
          <p className="text-sm text-gray-500">Games played</p>
        </div>
      </div>

      <GameHistory />
    </div>
  );
};