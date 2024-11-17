import { openDB } from 'idb';
import { Game, UserProfile } from '../types';

const DB_NAME = 'ChessScorekeeper';
const DB_VERSION = 2; // Increment version to trigger upgrade

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // If upgrading from a previous version, delete old stores
      if (oldVersion > 0) {
        if (db.objectStoreNames.contains('users')) {
          db.deleteObjectStore('users');
        }
        if (db.objectStoreNames.contains('games')) {
          db.deleteObjectStore('games');
        }
      }

      // Create users store
      const userStore = db.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('by_email', 'email', { unique: true });

      // Create games store
      const gameStore = db.createObjectStore('games', { keyPath: 'id' });
      gameStore.createIndex('by_user', 'userId', { unique: false });
      gameStore.createIndex('by_timestamp', 'timestamp', { unique: false });
    },
  });
  return db;
};

let dbPromise: Promise<ReturnType<typeof openDB>> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
};

export const createUser = async (user: UserProfile): Promise<void> => {
  const db = await getDB();
  await db.put('users', user);
};

export const saveUser = async (user: UserProfile): Promise<void> => {
  const db = await getDB();
  await db.put('users', user);
};

export const getUser = async (id: string): Promise<UserProfile | undefined> => {
  const db = await getDB();
  return db.get('users', id);
};

export const getUserByEmail = async (email: string): Promise<UserProfile | undefined> => {
  const db = await getDB();
  const tx = db.transaction('users', 'readonly');
  const index = tx.store.index('by_email');
  const result = await index.get(email);
  await tx.done;
  return result;
};

export const saveGame = async (game: Game): Promise<void> => {
  const db = await getDB();
  await db.put('games', game);
};

export const getUserGames = async (userId: string): Promise<Game[]> => {
  const db = await getDB();
  const tx = db.transaction('games', 'readonly');
  const index = tx.store.index('by_user');
  const games = await index.getAll(userId);
  await tx.done;
  return games;
};

export const deleteGame = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('games', id);
};