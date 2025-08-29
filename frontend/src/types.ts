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
  strategy?: string; // <-- CAMPO NOVO ADICIONADO AQUI
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
  date: string; // Mudou de bet_id para date
  cumulative_profit: number;
};