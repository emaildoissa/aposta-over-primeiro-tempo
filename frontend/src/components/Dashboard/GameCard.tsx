// src/components/Dashboard/GameCard.tsx
import { useState } from 'react';
import { type Game, type Bet } from '../../types';
import * as api from '../../services/api';

type GameCardProps = {
  game: Game;
  bets: Bet[];
  onDataUpdate: () => void; // Função para avisar o Dashboard que os dados mudaram
};

export default function GameCard({ game, bets, onDataUpdate }: GameCardProps) {
  // Estado local para os inputs do placar
  const [homeScore, setHomeScore] = useState(game.home_score?.Valid ? game.home_score.Int32.toString() : '');
  const [awayScore, setAwayScore] = useState(game.away_score?.Valid ? game.away_score.Int32.toString() : '');

  const handleResultChange = async (betId: number, newResult: string) => {
    try {
      await api.updateBetResult(betId, newResult);
      onDataUpdate(); // Avisa o Dashboard para recarregar tudo
    } catch (err) {
      alert("Erro ao atualizar resultado.");
    }
  };
  
  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (homeScore === '' || awayScore === '') {
        alert('Por favor, preencha ambos os valores do placar.');
        return;
    }
    try {
        await api.updateGameScore(game.id, Number(homeScore), Number(awayScore));
        alert('Placar salvo!');
        onDataUpdate(); // Avisa o Dashboard para recarregar tudo
    } catch {
        alert('Erro ao salvar placar.');
    }
  };

  const getBgColor = (result: string) => {
    if (result === "GREEN") return "#d4edda";
    if (result === "RED") return "#f8d7da";
    return "transparent";
  };
  
  return (
    <div style={{ border: "1px solid #eee", marginBottom: 20, borderRadius: 12, padding: '16px', backgroundColor: "white", boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', flex: '1 1 300px' }}>
          {game.home_team} vs {game.away_team} — <span style={{fontWeight: 400}}>{new Date(game.start_time).toLocaleString('pt-BR')}</span>
        </h3>
        <form onSubmit={handleScoreSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="number" value={homeScore} onChange={e => setHomeScore(e.target.value)} style={{ width: '60px', padding: '6px', textAlign: 'center' }} placeholder="Casa" />
          <span>x</span>
          <input type="number" value={awayScore} onChange={e => setAwayScore(e.target.value)} style={{ width: '60px', padding: '6px', textAlign: 'center' }} placeholder="Fora" />
          <button type="submit" style={{ padding: '6px 10px', cursor: 'pointer' }}>Salvar Placar</button>
        </form>
      </div>
      
      {bets.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '0.95rem', marginTop: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: "8px", textAlign: "left" }}>Mercado</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Odd</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Stake (R$)</th>
              <th style={{ padding: "8px", textAlign: "center", width: '150px' }}>Resultado</th>
              <th style={{ padding: "8px", textAlign: "right" }}>PnL (R$)</th>
            </tr>
          </thead>
          <tbody>
            {bets.map(bet => (
              <tr key={bet.id} style={{ backgroundColor: getBgColor(bet.result), borderBottom: '1px solid #eee' }}>
                <td style={{ padding: "8px", textAlign: "left" }}>{bet.market}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{bet.odd.toFixed(2)}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{bet.stake.toFixed(2)}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>
                  <select value={bet.result || ""} onChange={e => handleResultChange(bet.id, e.target.value)} style={{ padding: '4px', width: '100%' }}>
                    <option value="">Aberto</option>
                    <option value="GREEN">GREEN</option>
                    <option value="RED">RED</option>
                    <option value="VOID">VOID</option>
                  </select>
                </td>
                <td style={{ padding: "8px", textAlign: "right", fontWeight: 'bold', color: bet.pnl > 0 ? 'green' : bet.pnl < 0 ? 'red' : 'inherit' }}>
                  {bet.result ? bet.pnl.toFixed(2) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p>Nenhuma aposta para este jogo.</p>}
    </div>
  );
}