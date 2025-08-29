// src/contexts/DataContext.tsx
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { type ReactNode } from 'react';
import { type Game, type Bet } from '../types';
import * as api from '../services/api';

interface DataContextType {
  games: Game[];
  bets: Bet[];
  loading: boolean;
  error: string | null;
  refetchData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [gamesData, betsData] = await Promise.all([
        api.getGames(),
        api.getBets()
      ]);
      setGames(gamesData);
      setBets(betsData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha ao carregar dados.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider value={{ games, bets, loading, error, refetchData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};