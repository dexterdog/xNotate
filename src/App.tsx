import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Auth } from './components/Auth';
import { NewGame } from './components/NewGame';
import { ScoreSheet } from './components/ScoreSheet';
import { Stats } from './components/Stats';
import { useStore } from './store/useStore';
import { LayoutDashboard, GraduationCap } from 'lucide-react';

export default function App() {
  const { user, currentGame, loadUserGames } = useStore();
  const [activeTab, setActiveTab] = useState<'game' | 'stats'>('game');

  useEffect(() => {
    if (user) {
      loadUserGames(user.id);
    }
  }, [user]);

  // Switch to stats when there's no current game
  useEffect(() => {
    if (user && !currentGame) {
      setActiveTab('stats');
    }
  }, [currentGame, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-amber-50">
        <Toaster position="top-right" />
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Chess Scorekeeper</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('game')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'game'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-amber-50'
              }`}
            >
              <GraduationCap size={20} />
              Game
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'stats'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-amber-50'
              }`}
            >
              <LayoutDashboard size={20} />
              Stats
            </button>
          </div>
        </div>

        {activeTab === 'game' ? (
          currentGame ? <ScoreSheet /> : <NewGame />
        ) : (
          <Stats />
        )}
      </div>
    </div>
  );
}