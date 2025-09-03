// src/types.ts

export type NullableInt = {
  Int32: number;
  Valid: boolean;
} | null;

export type Game = {
  id: number;
  home_team: string;
  away_team: string;
  start_time: string;
  bets: Bet[];
  home_score: NullableInt;
  away_score: NullableInt;
  home_score_ht: NullableInt;
  away_score_ht: NullableInt;
};

export type Bet = {
  id: number;
  game_id: number;
  market: string;
  odd: number;
  stake: number;
  result: string;
  pnl: number;
  strategy?: string;
  notes?: string;
};

export type DashboardStats = {
  banca_inicial: number;
  banca_total: number;
  lucro_total: number;
  total_apostado: number;
  roi: number;
  total_apostas: number;
  apostas_vencidas: number;
  taxa_de_acerto: number;
};

export type EvolutionDataPoint = {
  date: string;
  cumulative_profit: number;
};

export type GamesResponse = {
  games: Game[];
  total: number;
};

export type BacktestInput = {
  entry_condition: string;
  market_to_bet: string;
  hypothetical_odd: number;
  hypothetical_stake: number;
};

export type BacktestResult = {
  total_simulated_bets: number;
  wins: number;
  losses: number;
  total_invested: number;
  total_pnl: number;
  roi: number;
};

export type ApiFilters = {
  market?: string;
  strategy?: string;
};

export type AuthInput = {
  email?: string;
  password?: string;
};

export type AuthResponse = {
  token: string;
};