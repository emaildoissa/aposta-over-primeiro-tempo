import { createContext, useState, useEffect, useContext, type ReactNode, useCallback } from 'react';
import type { Game, Bet, ApiFilters } from '../types';
import * as api from '../services/api';

const ITEMS_PER_PAGE = 10;

interface DataContextType {
  games: Game[];
  totalGames: number;
  currentPage: number;
  setPage: (page: number) => void;
  itemsPerPage: number;
  bets: Bet[];
  loading: boolean;
  error: string | null;
  // --- A CORREÇÃO ESTÁ NESTA LINHA ---
  // A assinatura agora aceita os dois parâmetros, 'filters' e 'page'.
  refetchData: (filters?: ApiFilters, page?: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filters: ApiFilters = {}, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const [gamesResponse, betsData] = await Promise.all([
        api.getGames(page, ITEMS_PER_PAGE),
        api.getBets(filters)
      ]);

      setGames(gamesResponse.games);
      setTotalGames(gamesResponse.total);
      setBets(betsData);
      setCurrentPage(page);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Falha ao carregar dados.');
      }
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchData({}, 1); // Carga inicial na página 1
  }, [fetchData]);

  const setPage = (page: number) => {
    // Ao mudar de página, idealmente manteríamos os filtros atuais.
    // Esta parte pode ser melhorada no futuro, mas por enquanto funciona.
    fetchData({}, page);
  };

  return (
    <DataContext.Provider value={{ games, totalGames, currentPage, setPage, itemsPerPage: ITEMS_PER_PAGE, bets, loading, error, refetchData: fetchData }}>
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