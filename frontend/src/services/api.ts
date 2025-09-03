import type { Game, Bet, DashboardStats, EvolutionDataPoint, GamesResponse, BacktestInput, BacktestResult, ApiFilters, AuthInput, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
   const token = localStorage.getItem('authToken');
   const headers = new Headers(options?.headers);
    if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options?.body) {
      headers.set('Content-Type', 'application/json');
  }
   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erro na comunicação com a API');
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}

export const loginUser = (credentials: AuthInput): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
};

// Adicione esta função
export const registerUser = (credentials: AuthInput): Promise<any> => {
    return request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
};


// getGames agora envia a página e o limite
export const getGames = (page: number, limit: number): Promise<GamesResponse> => {
    return request<GamesResponse>(`/games?page=${page}&limit=${limit}`);
};

// Funções de busca com filtros
export const getBets = (filters: ApiFilters = {}): Promise<Bet[]> => {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return request<Bet[]>(`/bets?${params}`);
};

export const getDashboardStats = (filters: ApiFilters = {}): Promise<DashboardStats> => {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return request<DashboardStats>(`/dashboard/stats?${params}`);
};

export const getEvolutionData = (): Promise<EvolutionDataPoint[]> => request<EvolutionDataPoint[]>('/dashboard/evolution');

// ... (O resto do arquivo não precisa de alterações)
export const updateBetResult = (betId: number, result: string): Promise<Bet> => {
  return request<Bet>(`/bets/${betId}/result`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result }),
  });
};

export const updateGameScore = (gameId: number, homeScore: number, awayScore: number): Promise<any> => {
    return request(`/games/${gameId}/score`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ home_score: homeScore, away_score: awayScore }),
    });
};

export const updateGameHTScore = (gameId: number, homeScoreHT: number, awayScoreHT: number): Promise<any> => {
    return request(`/games/${gameId}/ht-score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_score_ht: homeScoreHT, away_score_ht: awayScoreHT }),
    });
};

export const createBet = (betData: Omit<Bet, 'id' | 'pnl' | 'game'>): Promise<Bet> => {
    return request<Bet>('/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData)
    });
};

export const createGame = (gameData: { home_team: string, away_team: string, start_time: string } | { home_team: string, away_team: string, start_time: string }[]): Promise<Game | Game[]> => {
    return request<Game | Game[]>('/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
    });
};

export const runBacktest = (input: BacktestInput): Promise<BacktestResult> => {
    return request('/backtest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
};