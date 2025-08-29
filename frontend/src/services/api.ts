// src/services/api.ts
import { type Game, type Bet, type DashboardStats } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erro na comunicação com a API');
  }

  const text = await response.text();
  // --- CORREÇÃO AQUI ---
  // Usamos 'as T' para dizer ao TypeScript que o objeto vazio
  // deve ser tratado como o tipo genérico T.
  return text ? JSON.parse(text) : {} as T;
}

// Funções específicas da API
export const getGames = (): Promise<Game[]> => request<Game[]>('/games');

export const getBets = (): Promise<Bet[]> => request<Bet[]>('/bets');

export const getDashboardStats = (): Promise<DashboardStats> => request<DashboardStats>('/dashboard/stats');

export type EvolutionDataPoint = {
  bet_id: number;
  cumulative_profit: number;
};

export const getEvolutionData = (): Promise<EvolutionDataPoint[]> => request<EvolutionDataPoint[]>('/dashboard/evolution');

export const updateBetResult = (betId: number, result: string): Promise<Bet> => {
  return request<Bet>(`/bets/${betId}/result`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result }),
  });
};

export const createGame = (gameData: { home_team: string, away_team: string, start_time: string }): Promise<Game> => {
    return request<Game>('/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
    });
};

export const createBet = (betData: Omit<Bet, 'id' | 'pnl'>): Promise<Bet> => {
    return request<Bet>('/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData)
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

export const runBacktest = (input: any): Promise<any> => { // Use o tipo BacktestInput
  return request('/backtest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
};