// src/components/Dashboard/Dashboard.tsx
import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import * as api from '../../services/api';
import { type DashboardStats } from '../../types';
import styles from './Dashboard.module.css';
import EvolutionChart from '../EvolutionChart';
import GameCard from './GameCard'; // Importa o novo componente

const StatCard = ({ title, value, subtitle, variant }: { title: string, value: string, subtitle: string, variant: string }) => (
  <div className={`${styles.statCard} ${styles[variant]}`}>
    <h3>{title}</h3>
    <p>{value}</p>
    <span>{subtitle}</span>
  </div>
);

export default function Dashboard() {
  const { games, bets, loading: dataLoading, error: dataError, refetchData } = useData();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchAllDashboardData = async () => {
    setStatsLoading(true);
    // Podemos rodar o refetch e o fetchStats em paralelo
    await Promise.all([
      refetchData(),
      api.getDashboardStats().then(setStats)
    ]);
    setStatsLoading(false);
  };

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error).finally(() => setStatsLoading(false));
  }, []);

  const filteredGames = useMemo(() => {
    if (!filterDate) return games;
    return games.filter(game => game.start_time.startsWith(filterDate));
  }, [games, filterDate]);
  
  const getBetsForGame = (gameId: number) => bets.filter(bet => bet.game_id === gameId);
  
  if (dataLoading) return <p>Carregando dados da aplicação...</p>;
  if (dataError) return <p style={{ color: 'red' }}>{dataError}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Dashboard - Resumo da Banca</h2>
      {statsLoading ? <p>Calculando estatísticas...</p> : stats && (
        <div className={styles.statsGrid}>
          <StatCard title="Banca Total" value={stats.banca_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} subtitle={`Inicial: ${stats.banca_inicial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} variant="banca" />
          <StatCard title="ROI" value={`${stats.roi.toFixed(2)}%`} subtitle="Retorno Sobre Investimento" variant="roi" />
          <StatCard title="Taxa de Acerto" value={`${stats.taxa_de_acerto.toFixed(2)}%`} subtitle={`${stats.apostas_vencidas} de ${stats.total_apostas} apostas`} variant="acerto" />
          <StatCard title="Lucro Total" value={stats.lucro_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} subtitle={`${stats.total_apostas} apostas no total`} variant="lucro" />
        </div>
      )}

      <div style={{ margin: '40px 0', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <EvolutionChart />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ marginRight: '8px', fontWeight: 500 }}>Filtrar por Data:</label>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}/>
      </div>

      <div>
        {filteredGames.length === 0 ? (
          <p>Nenhum jogo cadastrado para esta data.</p>
        ) : (
          filteredGames.map(game => (
            <GameCard 
              key={game.id}
              game={game}
              bets={getBetsForGame(game.id)}
              onDataUpdate={fetchAllDashboardData}
            />
          ))
        )}
      </div>
    </div>
  );
}