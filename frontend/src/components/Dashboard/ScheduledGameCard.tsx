import { useState } from 'react';
import { type Game } from '../../types';
import * as api from '../../services/api';

type ScheduledGameCardProps = {
  game: Game;
  onBetPlaced: () => void; // Função para avisar o Dashboard que os dados mudaram
};

export default function ScheduledGameCard({ game, onBetPlaced }: ScheduledGameCardProps) {
  const [odd, setOdd] = useState('1.80');
  const [stake, setStake] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceBet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Cria o payload para a nova aposta
      const payload = {
        game_id: game.id,
        market: "Over 1.5 HT",
        odd: parseFloat(odd.replace(',', '.')),
        stake: parseFloat(stake.replace(',', '.')),
        strategy: "principal_o15ht",
        result: '',
      };

      // Valida se os números são válidos
      if (isNaN(payload.odd) || isNaN(payload.stake)) {
          throw new Error("Valores de Odd ou Stake são inválidos.");
      }

      await api.createBet(payload);

      alert(`Aposta principal para o jogo ${game.home_team} vs ${game.away_team} registrada!`);
      
      onBetPlaced(); // Chama a função para recarregar todos os dados do dashboard

    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao registrar a aposta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ border: "1px solid #e0e0e0", marginBottom: 16, borderRadius: 12, padding: 16, backgroundColor: "#fff5e6", boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <h4 style={{ marginTop: 0, marginBottom: 8 }}>{game.home_team} vs {game.away_team}</h4>
      <p style={{ margin: 0, marginBottom: 16, fontSize: '0.9rem', color: '#666' }}>{new Date(game.start_time).toLocaleString('pt-BR')}</p>
      <form onSubmit={handlePlaceBet} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{display: 'block', fontSize: '0.8em', marginBottom: '4px', fontWeight: 500}}>Odd Over 1.5 HT</label>
          <input 
            type="text" 
            value={odd} 
            onChange={e => setOdd(e.target.value)} 
            required 
            style={{padding: '8px', width: '100px', borderRadius: '6px', border: '1px solid #ccc'}}
          />
        </div>
        <div>
          <label style={{display: 'block', fontSize: '0.8em', marginBottom: '4px', fontWeight: 500}}>Stake (R$)</label>
          <input 
            type="text" 
            value={stake} 
            onChange={e => setStake(e.target.value)} 
            required
            style={{padding: '8px', width: '100px', borderRadius: '6px', border: '1px solid #ccc'}}
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#2274a5', color: 'white', cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>
          {isSubmitting ? 'Apostando...' : 'Fazer Aposta'}
        </button>
      </form>
    </div>
  );
}