// src/components/Backtester.tsx
import { useState } from 'react';
import * as api from '../services/api';

// Adicione estes tipos ao seu src/types.ts
/*
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
*/

export default function Backtester() {
  const [condition, setCondition] = useState('all_games');
  const [market, setMarket] = useState('Over 2.5 FT');
  const [odd, setOdd] = useState('1.90');
  const [stake, setStake] = useState('10');
  
  const [result, setResult] = useState<any>(null); // Use o tipo BacktestResult
  const [isLoading, setIsLoading] = useState(false);

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const input = {
        entry_condition: condition,
        market_to_bet: market,
        hypothetical_odd: parseFloat(odd.replace(',', '.')),
        hypothetical_stake: parseFloat(stake.replace(',', '.')),
      };
      const data = await api.runBacktest(input); // Adicione 'runBacktest' ao seu api.ts
      setResult(data);
    } catch (error) {
      alert("Erro ao rodar simulação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto' }}>
      <h1>Ferramenta de Backtesting</h1>
      <div style={{ display: 'flex', gap: '40px' }}>
        <form onSubmit={handleRunTest} style={{ flex: 1 }}>
          <h3>Definir Estratégia</h3>
          
          <label>Condição de Entrada:</label>
          <select value={condition} onChange={e => setCondition(e.target.value)}>
            <option value="all_games">Todos os Jogos</option>
            <option value="ht_score_0_0">Placar de 0x0 no Intervalo</option>
          </select>
          
          <label>Mercado a Apostar:</label>
          <select value={market} onChange={e => setMarket(e.target.value)}>
            <option value="Over 1.5 HT">Over 1.5 Gols (Intervalo)</option>
            <option value="Under 1.5 HT">Under 1.5 Gols (Intervalo)</option>
            <option value="Over 2.5 FT">Over 2.5 Gols (Final)</option>
          </select>

          <label>Odd Média Hipotética:</label>
          <input type="text" value={odd} onChange={e => setOdd(e.target.value)} required />
          
          <label>Stake Fixo (R$):</label>
          <input type="text" value={stake} onChange={e => setStake(e.target.value)} required />

          <button type="submit" disabled={isLoading}>{isLoading ? 'Processando...' : 'Rodar Simulação'}</button>
        </form>

        <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '40px' }}>
          <h3>Resultado da Simulação</h3>
          {isLoading && <p>Aguarde...</p>}
          {result && (
            <div>
              <p><strong>Total de Apostas Simuladas:</strong> {result.total_simulated_bets}</p>
              <p><strong>Acertos:</strong> {result.wins}</p>
              <p><strong>Erros:</strong> {result.losses}</p>
              <p><strong>Taxa de Acerto:</strong> {(result.wins / result.total_simulated_bets * 100).toFixed(2)}%</p>
              <hr/>
              <p><strong>Total Investido:</strong> R$ {result.total_invested.toFixed(2)}</p>
              <p><strong>Lucro/Prejuízo Total:</strong> R$ {result.total_pnl.toFixed(2)}</p>
              <p><strong>ROI:</strong> {result.roi.toFixed(2)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}