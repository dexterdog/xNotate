export interface Game {
  id: string;
  date: string;
  white: string;
  black: string;
  event: string;
  site: string;
  round: string;
  result: string;
  moves: string[];
  pgn: string;
  timestamp: number;
  userId: string;
}