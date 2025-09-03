import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import type { ReactNode } from 'react'; // Importação corrigida
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
  refetchData: (filters?: ApiFilters, page?: number) => Promise<void>;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [games, setGames] = useState<Game[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    // Limpa os dados ao deslogar
    setGames([]);
    setBets([]);
  };

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
      if (err instanceof Error) { setError(err.message); } 
      else { setError('Falha ao carregar dados.'); }
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    if (token) {
      // Passa a página atual ao recarregar
      fetchData({}, currentPage);
    } else {
      // Se não há token, não há o que carregar
      setLoading(false);
    }
  }, [token, fetchData, currentPage]);
  
  const setPage = (page: number) => {
    // Ao mudar de página, mantém os filtros atuais (uma melhoria futura)
    // Por enquanto, busca sem filtros na nova página
    if (token) {
        fetchData({}, page);
    }
  };

  return (
    <DataContext.Provider value={{ 
        games, 
        totalGames, 
        currentPage, 
        setPage, 
        itemsPerPage: ITEMS_PER_PAGE, 
        bets, 
        loading, 
        error, 
        refetchData: fetchData, 
        isAuthenticated: !!token, 
        login, 
        logout 
    }}>
      {children}
    </DataContext.Provider>
  );
};

// A função useData estava correta, mas a incluí aqui para garantir
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};