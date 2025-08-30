// src/components/RecoveryBetForm.tsx
import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import * as api from '../services/api';

export default function RecoveryBetForm() {
  const { games, refetchData } = useData();
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [homeScoreHT, setHomeScoreHT] = useState('');
  const [awayScoreHT, setAwayScoreHT] = useState('');
  
  const [htScoreSaved, setHtScoreSaved] = useState(false);
  const [liveOdd, setLiveOdd] = useState('');
  const [stake, setStake] = useState('');
  const [market, setMarket] = useState('Over 1.5 FT');
  
  // 1. ADICIONADO O ESTADO PARA AS OBSERVAÇÕES
  const [notes, setNotes] = useState('');

  const handleSaveHTScore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateGameHTScore(Number(selectedGameId), Number(homeScoreHT), Number(awayScoreHT));
      const totalGoalsHT = Number(homeScoreHT) + Number(awayScoreHT);
      
      if (totalGoalsHT <= 1) {
        setHtScoreSaved(true);
        alert('Placar de intervalo salvo! Agora você pode registrar a aposta de recuperação.');
      } else {
        alert('Placar de intervalo salvo, mas não elegível para aposta de recuperação (mais de 1 gol).');
        resetForm();
      }
      refetchData();
    } catch {
      alert('Erro ao salvar placar de intervalo.');
    }
  };

  const handlePlaceBet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        game_id: Number(selectedGameId),
        market: market,
        odd: parseFloat(liveOdd.replace(',', '.')),
        stake: parseFloat(stake.replace(',', '.')),
        result: '',
        strategy: 'recovery_ft',
        notes: notes, // 2. CORRIGIDO PARA 'notes' MINÚSCULO E USANDO O ESTADO
      };

      if (isNaN(payload.odd) || isNaN(payload.stake)) {
        throw new Error("Valores de Odd ou Stake inválidos.");
      }
      
      await api.createBet(payload);
      
      alert('Aposta de recuperação registrada com sucesso!');
      resetForm();
      refetchData();
    } catch (err) {
      alert(err instanceof Error ? `Erro: ${err.message}` : 'Erro ao registrar aposta.');
    }
  };
  
  const resetForm = () => {
    setSelectedGameId('');
    setHomeScoreHT('');
    setAwayScoreHT('');
    setHtScoreSaved(false);
    setLiveOdd('');
    setStake('');
    setNotes(''); // 3. ADICIONADO PARA LIMPAR O CAMPO
  };
  
  return (
    <div style={{ maxWidth: 500, margin: 'auto', background: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
      <h2 style={{textAlign: 'center'}}>Aposta de Recuperação (Live)</h2>
      
      {!htScoreSaved ? (
        <form onSubmit={handleSaveHTScore}>
          <h3>Passo 1: Informe o Placar do Intervalo</h3>
          <label>Selecione o Jogo:</label>
          <select value={selectedGameId} onChange={e => setSelectedGameId(e.target.value)} required style={{width: '100%', padding: '8px', marginBottom: '10px'}}>
            <option value="">Selecione...</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.home_team} vs {g.away_team}</option>)}
          </select>
          <label>Placar Intervalo Casa:</label>
          <input type="number" value={homeScoreHT} onChange={e => setHomeScoreHT(e.target.value)} required style={{width: '100%', padding: '8px', marginBottom: '10px'}}/>
          <label>Placar Intervalo Visitante:</label>
          <input type="number" value={awayScoreHT} onChange={e => setAwayScoreHT(e.target.value)} required style={{width: '100%', padding: '8px', marginBottom: '10px'}}/>
          <button type="submit" style={{width: '100%', padding: '10px', fontWeight: 'bold'}}>Salvar Placar HT e Validar</button>
        </form>
      ) : (
        <form onSubmit={handlePlaceBet}>
          <h3>Passo 2: Registre a Aposta</h3>
          <p><b>Jogo:</b> {games.find(g => g.id === Number(selectedGameId))?.home_team} vs {games.find(g => g.id === Number(selectedGameId))?.away_team}</p>
          <p><b>Placar HT:</b> {homeScoreHT} x {awayScoreHT}</p>
          
          <label>Mercado:</label>
          <select value={market} onChange={e => setMarket(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: '10px'}}>
            <option value="Over 1.5 FT">Over 1.5 Gols (Total)</option>
            <option value="Over 2.5 FT">Over 2.5 Gols (Total)</option>
          </select>
          
          <label>Odd Ao Vivo:</label>
          <input type="text" value={liveOdd} onChange={e => setLiveOdd(e.target.value)} required style={{width: '100%', padding: '8px', marginBottom: '10px'}}/>
          
          <label>Stake (R$):</label>
          <input type="text" value={stake} onChange={e => setStake(e.target.value)} required style={{width: '100%', padding: '8px', marginBottom: '10px'}}/>

          <label>Observações (Opcional):</label>
          <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Ex: Time da casa pressionando muito, odd de 2.10 aos 60 min."
              style={{width: '100%', minHeight: '60px', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px'}}
          />

          <button type="submit" style={{width: '100%', padding: '10px', fontWeight: 'bold'}}>Registrar Aposta</button>
          <button type="button" onClick={resetForm} style={{width: '100%', padding: '10px', marginTop: '10px', background: '#eee', border: '1px solid #ccc', color: '#333'}}>Cancelar</button>
        </form>
      )}
    </div>
  );
}