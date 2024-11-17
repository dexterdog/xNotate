import { create } from 'zustand';
import { Game, UserProfile } from '../types';
import { saveUser, saveGame, getUserGames, deleteGame } from '../utils/db';

interface Store {
  user: UserProfile | null;
  currentGame: Game | null;
  games: Game[];
  setUser: (user: UserProfile | null) => void;
  setCurrentGame: (game: Game | null) => void;
  setGames: (games: Game[]) => void;
  addMove: (move: string) => void;
  undoLastMove: () => void;
  finishGame: (result: string, pgn: string) => Promise<void>;
  loadUserGames: (userId: string) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  user: null,
  currentGame: null,
  games: [],
  setUser: async (user) => {
    if (user) {
      await saveUser(user);
    }
    set({ user });
  },
  setCurrentGame: (game) => set({ currentGame: game }),
  setGames: (games) => set({ games }),
  addMove: (move) => set((state) => ({
    currentGame: state.currentGame
      ? { ...state.currentGame, moves: [...state.currentGame.moves, move] }
      : null
  })),
  undoLastMove: () => set((state) => ({
    currentGame: state.currentGame
      ? { ...state.currentGame, moves: state.currentGame.moves.slice(0, -1) }
      : null
  })),
  finishGame: async (result, pgn) => {
    const state = get();
    if (state.currentGame && state.user) {
      const finishedGame = { 
        ...state.currentGame, 
        result,
        pgn,
        timestamp: Date.now()
      };
      await saveGame(finishedGame);
      set((state) => ({
        games: [...state.games, finishedGame],
        currentGame: null
      }));
    }
  },
  loadUserGames: async (userId) => {
    const games = await getUserGames(userId);
    set({ games });
  },
  deleteGame: async (gameId) => {
    await deleteGame(gameId);
    set((state) => ({
      games: state.games.filter(g => g.id !== gameId)
    }));
  }
}));